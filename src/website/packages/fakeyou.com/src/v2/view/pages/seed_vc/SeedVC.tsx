import React from "react";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Countdown from "components/common/Countdown";
import FAQSection from "components/common/FAQSection";
//

const endDate = new Date("2024-10-23T12:00:00-04:00");

export default function SeedVC() {
  usePrefixedDocumentTitle("Seed-VC Zero-shot Voice Conversion");

  return (
    <>
      <div
        style={{
          background: `url("/images/bg-svg.svg") no-repeat center center`,
          backgroundSize: "cover",
          width: "100%",
          height: "100vh",
        }}
      >
        <Countdown
          endDate={endDate}
          title="Seed-VC Zero-shot Voice Conversion"
          description="New zero-shot voice conversion coming soon..."
          icon={faWaveform}
        />
      </div>

      {/* <HowToUseSection title="How to Use F5-TTS" steps={howToUseSteps} /> */}

      <FAQSection faqItems={faqItems} className="mt-5 pt-5" />
    </>
  );
}

const faqItems = [
  {
    question: "What is Seed-VC Zero-shot Voice Conversion?",
    answer:
      "Seed-VC Zero-shot Voice Conversion is an advanced AI-powered tool designed for state-of-the-art voice conversion and singing voice conversion. It uses in-context learning to transform one voice into another without any prior training, making it an ideal choice for projects that require versatile voice modification.",
  },
  {
    question: "How does Seed-VC work?",
    answer:
      "Seed-VC leverages cutting-edge AI techniques, including zero-shot learning, to convert voices with just a short audio reference (1–30 seconds). It can adapt to both speaking and singing voices, creating natural-sounding results without the need for extensive data or training.",
  },
  {
    question: "What kind of voice quality can I expect from Seed-VC?",
    answer:
      "Seed-VC delivers high-quality, natural-sounding voice conversions, suitable for professional applications like dubbing, voice-overs, and even singing voice transformations. The AI is designed to retain the unique qualities of the target voice while maintaining clear and lifelike output.",
  },
  {
    question: "Can Seed-VC be used for voice-over and dubbing work?",
    answer:
      "Definitely! Seed-VC's zero-shot capabilities make it perfect for voice-over and dubbing. Whether you need to create different voices for various characters or adapt a voice to a new language, it can handle the task seamlessly. It also supports singing voice conversion, adding flexibility to musical projects.",
  },
];

// const howToUseSteps = [
//   {
//     icon: faWaveformLines,
//     title: "Step 1: Upload Your Audio",
//     description:
//       "In the panel above, start by adding a reference audio, either record your own voice or upload an audio file. This audio will be used by F5-TTS to clone the voice, enabling the generation of speech that closely resembles the reference voice. For optimal results, ensure the audio is clear and of high quality.",
//   },
//   {
//     icon: faTextSize,
//     title: "Step 2: Enter Your Text",
//     description:
//       "Next, input the text you wish to convert into speech. This text will be synthesized using the voice from your reference audio, allowing you to create personalized audio content. Ensure your text is clear and concise for the best results.",
//   },
//   {
//     icon: faArrowDownToLine,
//     title: "Step 3: Generate and Save",
//     description: (
//       <>
//         With your audio and text prepared, click 'Generate Speech' to activate
//         F5-TTS and transform your text into lifelike speech. Once the process is
//         complete, you can listen to the synthesized audio directly in the output
//         panel above. If you're happy with the result, click the download button
//         to save the audio file and use it in your projects!
//       </>
//     ),
//   },
// ];
