import { useSignals } from "@preact/signals-react/runtime";
import { RemixVideo } from "~/pages/PageEnigma/Wizard/RemixVideo";
import { pageHeight } from "~/signals";
const cards = [
  {
    title: "Dragon Plays Concert",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/v/3/v/a/c/v3vacb5910g6vfhjc2aemjghshpq2fs8/videov3vacb5910g6vfhjc2aemjghshpq2fs8mp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/a/0/p/5/a/a0p5a0dc021qam59e0pxjtg9sk59mcg2/a0p5a0dc021qam59e0pxjtg9sk59mcg2.mp4",
    token: "m_qsjwkd8ap8mnvskm0dqbf9ewk8dg4m",
    text: "Some introductory text. Some introductory text. Some introductory text. Some introductory text",
  },
  {
    title: "Home Office",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/f/g/s/d/m/fgsdm4v1mv2nqd5y1y6an46zmj4sx5vt/videofgsdm4v1mv2nqd5y1y6an46zmj4sx5vtmp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/2/1/t/v/e/21tvezwdmevrqdmd3zttspykenktepx4/21tvezwdmevrqdmd3zttspykenktepx4.mp4",
    token: "m_7m8qvhmr55w4d7c31a7f4yjdtm22ww",
    text: "Some introductory text",
  },
  {
    title: "Desert Fox",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/a/p/j/b/q/apjbqp06we4xf51aaqt4rhb7bpvdg90p/videoapjbqp06we4xf51aaqt4rhb7bpvdg90pmp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/w/n/5/7/4/wn574b0qqy64xymthbk0y806czmmn0jx/wn574b0qqy64xymthbk0y806czmmn0jx.mp4",
    token: "m_dzsxjjjyx18k3x2rsys5zkm94x73kt",
    text: "Some introductory text",
  },
  {
    title: "Castle Airship",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/v/e/c/3/c/vec3cwk00xvrafv7rgvhfvbhqtm72pr7/videovec3cwk00xvrafv7rgvhfvbhqtm72pr7mp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/q/h/h/r/f/qhhrf4tddye8jpfrz030ja425nkxymr3/qhhrf4tddye8jpfrz030ja425nkxymr3.mp4",
    token: "m_n6rxmbn7abz29vmcecrkrgytxw55kr",
    text: "Some introductory text",
  },
  {
    title: "Forest Friends",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/k/v/r/0/w/kvr0wsw87gmkx6psfp73v34behs2vd34/videokvr0wsw87gmkx6psfp73v34behs2vd34mp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/g/1/s/n/d/g1snde1192qbe3nctpa3p0f2xhgrdjkm/g1snde1192qbe3nctpa3p0f2xhgrdjkm.mp4",
    token: "m_qnvcv073za8b5y23fra4vbt8cea2c3",
    text: "Some introductory text",
  },
  {
    title: "Pirate Island",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/4/d/a/q/1/4daq1tz77rahrr5kt8wa45y6z93hy6fd/video4daq1tz77rahrr5kt8wa45y6z93hy6fdmp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/9/9/g/c/f/99gcfq21cafy6frtp1afdff11f45sm1w/99gcfq21cafy6frtp1afdff11f45sm1w.mp4",
    token: "m_m5vgpxd99dak30t1cw4dsaj4jarhvt",
    text: "Some introductory text",
  },
  {
    title: "Dragon Plays Concert",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/v/3/v/a/c/v3vacb5910g6vfhjc2aemjghshpq2fs8/videov3vacb5910g6vfhjc2aemjghshpq2fs8mp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/a/0/p/5/a/a0p5a0dc021qam59e0pxjtg9sk59mcg2/a0p5a0dc021qam59e0pxjtg9sk59mcg2.mp4",
    token: "m_qsjwkd8ap8mnvskm0dqbf9ewk8dg4r",
    text: "Some introductory text",
  },
  {
    title: "Home Office",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/f/g/s/d/m/fgsdm4v1mv2nqd5y1y6an46zmj4sx5vt/videofgsdm4v1mv2nqd5y1y6an46zmj4sx5vtmp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/2/1/t/v/e/21tvezwdmevrqdmd3zttspykenktepx4/21tvezwdmevrqdmd3zttspykenktepx4.mp4",
    token: "m_7m8qvhmr55w4d7c31a7f4yjdtm22wr",
    text: "Some introductory text",
  },
  {
    title: "Desert Fox",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/a/p/j/b/q/apjbqp06we4xf51aaqt4rhb7bpvdg90p/videoapjbqp06we4xf51aaqt4rhb7bpvdg90pmp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/w/n/5/7/4/wn574b0qqy64xymthbk0y806czmmn0jx/wn574b0qqy64xymthbk0y806czmmn0jx.mp4",
    token: "m_dzsxjjjyx18k3x2rsys5zkm94x73kr",
    text: "Some introductory text",
  },
  {
    title: "Castle Airship",
    defaultVideo:
      "https://storage.googleapis.com/vocodes-public/media/v/e/c/3/c/vec3cwk00xvrafv7rgvhfvbhqtm72pr7/videovec3cwk00xvrafv7rgvhfvbhqtm72pr7mp4",
    hoverVideo:
      "https://storage.googleapis.com/vocodes-public/media/q/h/h/r/f/qhhrf4tddye8jpfrz030ja425nkxymr3/qhhrf4tddye8jpfrz030ja425nkxymr3.mp4",
    token: "m_n6rxmbn7abz29vmcecrkrgytxw55kt",
    text: "Some introductory text",
  },
];
export const Remix = () => {
  useSignals();

  return (
    <div>
      <div
        className="grid grid-cols-3 gap-4 overflow-y-auto"
        style={{ height: pageHeight.value * 0.8 }}
      >
        {cards.map((card) => (
          <RemixVideo card={card} key={card.token} />
        ))}
      </div>
    </div>
  );
};
