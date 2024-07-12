import { Response, Request } from "express";
import ffmpegClass from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { getMediaFile } from "./getMediaFile";
import { ArtStyle, ClipType, Visibility, ClipUI } from "common";
import * as fs from "fs";
import { Canvas, Image } from "canvas";
import * as child_process from "child_process";
import * as uuid from "uuid";
import { uploadMediaFile } from "./uploadMediaFile";
import { stylizeVideo } from "./stylizeVideo";

interface Video {
  timeline_limit: number;
  cap_fps: number;
  frame_buffer: string[];
  art_style: ArtStyle;
  timeline_items: ClipUI[];
  current_scene_media_token: string;
  positive_prompt: string;
  negative_prompt: string;
  title?: string;
  generation_options: {
    faceDetail: boolean;
    upscale: boolean;
    styleStrength: number;
  };
}

ffmpegClass.setFfmpegPath(ffmpegStatic!);

async function convertAudioClip(
  iteration: number,
  clip: ClipUI,
  video: Video,
  folder: string,
) {
  // Base audio clip names.
  const wav_name: string = `./${folder}/audio/tmp${iteration}.wav`;
  let startFrame: number = clip.start_offset;
  let endFrame: number = clip.ending_offset;

  if (endFrame > video.timeline_limit) {
    endFrame = video.timeline_limit;
  }
  if (startFrame > video.timeline_limit) {
    startFrame = video.timeline_limit - 1;
  }

  console.log("clip", clip);
  const startTime: number = Math.round(startFrame / video.cap_fps);
  const endTime: number = Math.round(endFrame / video.cap_fps);
  const end: number = endTime - startTime;

  // Use ffmpeg to convert audio to video.
  const audioSegment: string = `./${folder}/audio/as_tmp${iteration}.wav`;
  const fileData = await fetchFile(await getMediaFile(clip.media_id));
  await new Promise<void>((resolve, reject) => {
    fs.writeFile(wav_name, fileData, {}, () => {
      ffmpegClass()
        .input(wav_name)
        .inputOptions(["-ss 0", `-to ${end}`])
        .outputOptions(["-max_muxing_queue_size 999999"])
        .saveToFile(audioSegment)
        .on("end", () => {
          console.log(`audio ${iteration} written`);
          resolve();
        })
        .on("error", (err) => {
          console.log(err);
          reject();
        });
    });
  });

  await new Promise<void>((resolve, reject) => {
    ffmpegClass()
      .input(`./${folder}/videos/tmp${iteration}.mp4`)
      .outputOptions(["-max_muxing_queue_size 999999"])
      .saveToFile(`./${folder}/audio/empty_tmp${iteration}.wav`)
      .on("end", () => {
        console.log(`audio ${iteration} copied empty`);
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      });
  });

  await new Promise<void>((resolve, reject) => {
    ffmpegClass()
      .input(`./${folder}/audio/empty_tmp${iteration}.wav`)
      .input(audioSegment)
      .inputOptions([
        `-filter_complex [1:a]adelay=${startTime * 1000}|${startTime * 1000}[a1];[0:a][a1]amix=inputs=2[a]`,
      ])
      .outputOptions(["-map [a]"])
      .saveToFile(`./${folder}/audio/final_tmp${iteration}.wav`)
      .on("end", () => {
        console.log(`audio ${iteration} written copied`);
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      });
  });

  await new Promise<void>((resolve, reject) => {
    ffmpegClass()
      .input(`./${folder}/videos/tmp${iteration}.mp4`)
      .input(`./${folder}/audio/final_tmp${iteration}.wav`)
      .videoCodec("copy")
      .audioCodec("aac")
      .outputOptions(["-map 0:v:0", "-map 1:a:0"])
      .saveToFile(`./${folder}/videos/tmp${iteration + 1}.mp4`)
      .on("end", () => {
        console.log(`final video ${iteration} written`);
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      });
  });
}

async function stopPlaybackAndUploadVideo(
  video: Video,
  compile_audio: boolean = true,
  sessionToken: string,
) {
  console.log("Start #frames", video.frame_buffer.length);
  const canvas = new Canvas(1024, 576);
  const context = canvas.getContext("2d");
  const folder = uuid.v4();
  // use then...
  await new Promise<void>((resolve) => {
    fs.mkdir(`./${folder}`, () => {
      fs.mkdir(`./${folder}/images`, () => {
        fs.mkdir(`./${folder}/videos`, () => {
          fs.mkdir(`./${folder}/audio`, () => resolve());
        });
      });
    });
  });

  for (let index = 0; index < video.frame_buffer.length; index++) {
    await new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0);
        resolve();
      };
      image.src = video.frame_buffer[index];
    });

    const fileData = canvas.toBuffer();
    await new Promise<void>((resolve) =>
      fs.writeFile(
        `./${folder}/images/image${("00" + index).slice(-3)}.png`,
        fileData,
        () => resolve(),
      ),
    );
  }

  console.log("files created");

  await new Promise<void>((resolve, reject) => {
    ffmpegClass()
      .input(`./${folder}/images/image%03d.png`)
      .inputOptions([`-framerate ${video.cap_fps}`])
      .fps(video.cap_fps)
      .saveToFile(`./${folder}/videos/step1.mp4`)
      .on("end", () => {
        console.log("Frames merged into video");
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      });
  });

  await new Promise<void>((resolve, reject) => {
    ffmpegClass()
      .input(`./${folder}/videos/step1.mp4`)
      .input("anullsrc")
      .inputOptions(["-f lavfi"])
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-max_muxing_queue_size 999999",
        "-vf select=gte(n\\,1),scale=1260:720",
        "-shortest",
        "-pix_fmt yuv420p",
      ])
      .saveToFile(`./${folder}/videos/tmp0.mp4`)
      .on("end", () => {
        console.log("Final video before adding audio");
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      });
  });
  //
  // await new Promise<void>((resolve, reject) => {
  //   const process = child_process.exec(
  //     `./scripts/ffmpeg-1.sh ${folder}`,
  //     {},
  //     (err) => {
  //       if (err) {
  //         console.log(err);
  //         reject(err);
  //         return;
  //       }
  //       console.log("exec 1 finished");
  //       resolve();
  //     },
  //   );
  //   process.stdout?.on("data", (data) => console.log(data));
  // });

  let iteration = 0;

  if (compile_audio) {
    for (const clip of video.timeline_items) {
      if (clip.type === ClipType.AUDIO) {
        await convertAudioClip(iteration, clip, video, folder);
        iteration += 1;
      }
    }
  }

  console.log("audio finsihed", iteration);

  fs.readFile(
    `./${folder}/videos/tmp${iteration}.mp4`,
    {},
    async (err, data) => {
      if (err) {
        throw err;
      }

      // Create a Blob from the output file for downloading
      const blob = new Blob([data], { type: "video/mp4" });

      const title = video.title || "Untitled";

      const style_name = video.art_style.toString();
      const media_token = video.current_scene_media_token || undefined;

      console.log("Upload file");
      // TODO REPLACE
      const uploadData: any = await uploadMediaFile({
        blob,
        fileName: `${title}.mp4`,
        title,
        styleName: style_name,
        maybe_scene_source_media_file_token: media_token,
        sessionToken,
      });
      console.log("uploaded", uploadData);
      if (data == null) {
        return;
      }
      const upload_token = uploadData["media_file_token"];

      await stylizeVideo({
        media_token: upload_token,
        style: video.art_style,
        positive_prompt: video.positive_prompt,
        negative_prompt: video.negative_prompt,
        visibility: Visibility.Public,
        use_face_detailer: video.generation_options.faceDetail,
        use_upscaler: video.generation_options.upscale,
        use_strength: video.generation_options.styleStrength,
        sessionToken,
      }).catch((error) => {
        // TODO handle stylize error.
        console.log(error);
      });

      console.log("end");
      fs.rm(`./${folder}`, { recursive: true, force: true }, () => {});
    },
  );
}

export const uploadVideo = async (req: Request, res: Response) => {
  const body = req.body as { video: Video; compile_audio: boolean };
  res.send({ success: true });
  const sessionToken = req.headers.session as string;
  await stopPlaybackAndUploadVideo(
    body.video,
    body.compile_audio,
    sessionToken,
  );
};
