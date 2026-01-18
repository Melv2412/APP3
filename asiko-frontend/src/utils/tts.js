export function speakFrench(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  const voices = synth.getVoices();
  const frenchFemale = voices.find(
    v => v.lang === "fr-FR" && v.name.toLowerCase().includes("female")
  ) || voices.find(v => v.lang === "fr-FR");

  if (frenchFemale) {
    utterance.voice = frenchFemale;
  }

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  synth.speak(utterance);
}
