import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";
import { EngineMode } from "./EngineMode";
import { GetEngineUrl } from "./GetEngineUrl";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";
import { WeightType } from "@storyteller/components/src/api/_common/enums/WeightType";
import { MediaFileSubtype } from "@storyteller/components/src/api/enums/MediaFileSubtype";

describe('mode', () => {
  test('studio', () => {
    const url = GetEngineUrl({mode: EngineMode.Studio, asset: { objectId: "foo" } });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&objectId=foo");
  });

  test('viewer', () => {
    const url = GetEngineUrl({mode: EngineMode.Viewer, asset: { objectId: "foo" } });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=viewer&objectId=foo");
  });
});

describe('skybox', () => {
  test('from named skybox', () => {
    const url = GetEngineUrl({mode: EngineMode.Studio, asset: { objectId: "foo" }, skybox: "gum_trees_4k" });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&skybox=gum_trees_4k&objectId=foo");
  });

  test('from hex color', () => {
    const url = GetEngineUrl({mode: EngineMode.Studio, asset: { objectId: "foo" }, skybox: "ff0000" });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&skybox=ff0000&objectId=foo");
  });
});

describe('storyteller scene media file tokens', () => {
  test('scene token urls should work', () => {
    const url = GetEngineUrl({mode: EngineMode.Studio, asset: { storytellerSceneMediaFileToken: "TOKEN" } });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&scene=remote://TOKEN.scn.ron");
  });
});

describe('object ids', () => {
  test('object id urls should work', () => {
    const url = GetEngineUrl({mode: EngineMode.Studio, asset: { objectId: "foo" } });
    expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&objectId=foo");
  });
});

// TODO(bt,2024-03-11): We're only testing one type of media file
describe('media files', () => {
  let mediaFile = {
    token: "MEDIA_FILE_TOKEN",
    media_type: MediaFileType.GLB,
    maybe_media_subtype: null,
    public_bucket_path: "path/to/file",
    maybe_batch_token: "BATCH_TOKEN",
    created_at: new Date(),
    updated_at: new Date(),
    maybe_creator_user: null,
    creator_set_visibility: "public",
    // TODO(bt,2024-03-11): Make these fields optional
    maybe_model_weight_info: {
      title: "title",
      weight_token: "WEIGHT_TOKEN",
      weight_category: WeightCategory.SD,
      weight_type: WeightType.HIFIGAN_TT2,
      maybe_cover_image_public_bucket_path: "image",
      maybe_weight_creator: {
        user_token: "USER_TOKEN",
        username: "username",
        display_name: "display_name",
        gravatar_hash: "foo",
        default_avatar: {
          image_index: 1,
          color_index: 2,
        }
      },
    }
  };

  describe('scene files', () => {
    test('from media type', () => {
      mediaFile.media_type = MediaFileType.SceneRon;

      // NB: Not the real subtype; forcing test to act on type.
      mediaFile.maybe_media_subtype = null; 

      const url = GetEngineUrl({mode: EngineMode.Studio, asset: mediaFile });
      expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&scene=remote://MEDIA_FILE_TOKEN.scn.ron");
    });

    test('from media subtype', () => {
      // NB: Not the real time; forcing test to act on subtype.
      mediaFile.media_type = MediaFileType.Audio; 

      // TODO(bt,2024-03-11): Why does the IDE complain about types here?
      mediaFile.maybe_media_subtype = MediaFileSubtype.StorytellerScene as any; 

      const url = GetEngineUrl({mode: EngineMode.Studio, asset: mediaFile });
      expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&scene=remote://MEDIA_FILE_TOKEN.scn.ron");
    });
  });

  describe('mixamo animations', () => {
    test('from media subtype', () => {
      // NB: Not the real time; forcing test to act on subtype.
      mediaFile.media_type = MediaFileType.Audio; 

      // TODO(bt,2024-03-11): Why does the IDE complain about types here?
      mediaFile.maybe_media_subtype = MediaFileSubtype.Mixamo as any; 

      const url = GetEngineUrl({mode: EngineMode.Studio, asset: mediaFile });
      expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&mixamo=https://storage.googleapis.com/dev-vocodes-public/path/to/file");
    });
  });

  describe('bvh animations', () => {
    test('from media subtype', () => {
      // NB: Not the real time; forcing test to act on subtype.
      mediaFile.media_type = MediaFileType.Audio; 

      // TODO(bt,2024-03-11): Why does the IDE complain about types here?
      mediaFile.maybe_media_subtype = MediaFileSubtype.MocapNet as any; 

      const url = GetEngineUrl({mode: EngineMode.Studio, asset: mediaFile });
      expect(url).toEqual("https://engine.fakeyou.com/?mode=studio&bvh=https://storage.googleapis.com/dev-vocodes-public/path/to/file");
    });
  });
});
