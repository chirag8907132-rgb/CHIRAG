import { VoiceOption, EmotionTone, Language } from '../types';

export const VOICES: VoiceOption[] = [
  {
    id: 'Aarav',
    name: 'Aarav (ElevenLabs 7b9mYhmn)',
    gender: 'male',
    accent: 'Warm Expressive Indian Accent',
    description: 'Replicates ElevenLabs 7b9mYhmn voice signature: Warm, expressive Indian male tone for reels, podcasts & narration without any ElevenLabs charges.',
    previewText: {
      en: 'Hello! I am Aarav. Enjoy the warmth of the 7b9mYhmn ElevenLabs voice signature with zero subscription charges!',
      hi: 'नमस्ते! मैं आरव हूँ। इस ElevenLabs स्टाइल आवाज़ का आप बिना किसी शुल्क के उपयोग कर सकते हैं।',
      hinglish: 'Hey everyone! Main Aarav hoon. ElevenLabs ki 7b9mYhmn voice signature ab VoiceStudio me bilkul FREE available hai.'
    }
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'female',
    accent: 'Warm & Natural Indian Accent',
    description: 'Versatile, friendly, and crystal-clear voice ideal for Hinglish & Hindi tutorials or audiobooks.',
    previewText: {
      en: 'Hello! I am Kore. I can turn your scripts into natural, human-like voiceovers.',
      hi: 'नमस्ते! मैं कोरे हूँ। आपकी लिखावट को मैं सुंदर और स्वाभाविक आवाज़ में बदल सकती हूँ।',
      hinglish: 'Hey there! Main Kore hoon. Aapke Hinglish aur Hindi content ko super realistic audio me convert kar sakti hoon.'
    }
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'male',
    accent: 'Conversational & Energetic',
    description: 'Upbeat, youthful male voice perfect for podcasts, YouTube videos, and casual Hinglish chatter.',
    previewText: {
      en: 'Hey guys! Puck here. Ready to convert your script into engaging speech with no limits.',
      hi: 'नमस्ते दोस्तों! मैं पक हूँ। चलिए आपके शब्दों को एकदम जानदार आवाज़ में बदलते हैं।',
      hinglish: 'Kya haal hai dost! Main Puck hoon. Aapke Hinglish posts aur reel scripts ke liye mera voice best hai.'
    }
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'male',
    accent: 'Deep & Authoritative',
    description: 'Resonant, confident male tone suited for news reports, documentaries, and executive narration.',
    previewText: {
      en: 'Welcome. I am Charon. Delivering deep, articulate, and authoritative audio presentations.',
      hi: 'नमस्कार। मैं चारोन हूँ। गंभीर, स्पष्ट और प्रभावशाली समाचार या प्रस्तुतियों के लिए मेरी आवाज़ चुनें।',
      hinglish: 'Hello everyone. Main Charon hoon. Professional news, business presentations aur serious topics ke liye main ready hoon.'
    }
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'male',
    accent: 'Dynamic & Expressive Storyteller',
    description: 'Rich, expressive voice with strong emotional depth for stories, audiobooks, and audio dramas.',
    previewText: {
      en: 'Once upon a time... Fenrir here, bringing dramatic depth and intense emotion to your stories.',
      hi: 'एक समय की बात है... मैं फेनरिर हूँ। कहानियों और नाटकों में सच्ची भावनाएं भरने के लिए।',
      hinglish: 'Ek alag hi duniya ki kahani... Fenrir ki voice aapke storytelling aur suspense scripts ke liye super effective hai.'
    }
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'female',
    accent: 'Gentle, Smooth & Meditative',
    description: 'Soft, calming female tone best for guided relaxation, bedtime stories, and educational lessons.',
    previewText: {
      en: 'Take a deep breath. I am Zephyr, bringing calm, soothing, and relaxing audio experiences.',
      hi: 'गहरी सांस लें। मैं ज़ेफिर हूँ। ध्यान, सुकून और शांति भरी बातें सुनने के लिए तैयार हो जाइए।',
      hinglish: 'Relax ho jaiye. Zephyr ki smooth aur calm voice aapke meditation ya late night thoughts ke liye perfect hai.'
    }
  }
];

export interface TonePreset {
  id: EmotionTone;
  label: string;
  category: 'emotion' | 'style';
  icon: string;
  emoji: string;
  description: string;
  instruction: string;
}

export const TONE_PRESETS: TonePreset[] = [
  // Emotions
  {
    id: 'joyful',
    label: 'Joyful',
    category: 'emotion',
    icon: 'Smile',
    emoji: '😊',
    description: 'Upbeat, happy, bright expression',
    instruction: 'Speak in a joyful, happy, upbeat voice with bright expression and warm smiles in the tone.'
  },
  {
    id: 'sad',
    label: 'Sad',
    category: 'emotion',
    icon: 'Frown',
    emoji: '😢',
    description: 'Somber, melancholic, soft tone',
    instruction: 'Speak in a sad, melancholic, soft voice expressing gentle sorrow, grief, or vulnerability.'
  },
  {
    id: 'neutral',
    label: 'Neutral',
    category: 'emotion',
    icon: 'MinusCircle',
    emoji: '😐',
    description: 'Balanced, natural, clear cadence',
    instruction: 'Speak in a balanced, neutral, clear voice with natural rhythm and no heavy emotion.'
  },
  {
    id: 'excited',
    label: 'Excited',
    category: 'emotion',
    icon: 'Zap',
    emoji: '🤩',
    description: 'Vibrant, fast-paced, high energy',
    instruction: 'Speak with high excitement, vibrant energy, fast pace, and enthusiastic celebration!'
  },
  {
    id: 'concerned',
    label: 'Concerned',
    category: 'emotion',
    icon: 'AlertCircle',
    emoji: '😟',
    description: 'Caring, sympathetic, reassuring',
    instruction: 'Speak in a concerned, empathetic, caring, and sympathetic voice with gentle reassurance.'
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    category: 'emotion',
    icon: 'Flame',
    emoji: '🎭',
    description: 'Intense feeling & suspenseful depth',
    instruction: 'Deliver with intense emotional weight, dramatic tension, and deep feeling.'
  },
  {
    id: 'calm',
    label: 'Calm',
    category: 'emotion',
    icon: 'Heart',
    emoji: '🧘',
    description: 'Soothing, gentle, slow-tempo rhythm',
    instruction: 'Deliver in a soft, peaceful, soothing, and slow-paced voice.'
  },
  {
    id: 'whisper',
    label: 'Whisper',
    category: 'emotion',
    icon: 'VolumeX',
    emoji: '🤫',
    description: 'Hushed, soft-spoken, intimate whisper',
    instruction: 'Speak in a quiet, hushed, soft-spoken whisper with delicate breath sounds.'
  },
  {
    id: 'angry',
    label: 'Angry',
    category: 'emotion',
    icon: 'Flame',
    emoji: '😡',
    description: 'Fierce, intense, commanding anger',
    instruction: 'Speak in a fierce, intense, passionate, and angry tone with strong vocal projection.'
  },
  {
    id: 'fearful',
    label: 'Fearful',
    category: 'emotion',
    icon: 'ShieldAlert',
    emoji: '😱',
    description: 'Tense, hushed, anxious urgency',
    instruction: 'Speak in a tense, fearful, hushed voice with anxious urgency or suspense.'
  },

  // Speaking Styles
  {
    id: 'conversational',
    label: 'Conversational',
    category: 'style',
    icon: 'MessageSquare',
    emoji: '💬',
    description: 'Friendly, relaxed everyday chat',
    instruction: 'Deliver in a warm, natural, everyday conversational voice with relaxed rhythm.'
  },
  {
    id: 'formal',
    label: 'Formal / News',
    category: 'style',
    icon: 'Radio',
    emoji: '📰',
    description: 'Crisp, articulate & authoritative',
    instruction: 'Deliver in a crisp, confident, formal news broadcasting voice with clear articulation.'
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    category: 'style',
    icon: 'BookOpen',
    emoji: '📖',
    description: 'Engaging narration & rich inflection',
    instruction: 'Narrate expressively with rich emotion, natural emphasis, and engaging storytelling pauses.'
  },
  {
    id: 'promotional',
    label: 'Promotional / Ad',
    category: 'style',
    icon: 'Megaphone',
    emoji: '📢',
    description: 'Persuasive, high-impact marketing',
    instruction: 'Deliver in a persuasive, high-impact promotional style suitable for ads, commercials, or trailers.'
  }
];

export const LANGUAGE_OPTIONS: { id: Language; label: string; flag: string; badge: string; sample: string }[] = [
  {
    id: 'auto',
    label: 'Auto-Detect Language',
    flag: '✨',
    badge: 'Smart Switch',
    sample: 'Namaste! Welcome to Voice Studio. Automatic language switching for Hindi, Hinglish, and English scripts.'
  },
  {
    id: 'hinglish',
    label: 'Hinglish (Hindi in Roman Script)',
    flag: '🇮🇳',
    badge: 'Popular',
    sample: 'Aaj ka din bohot special hai! Hum ek naya AI text-to-speech generator explore kar rahe hain jo bilkul real human ki tarah bolta hai.'
  },
  {
    id: 'hi',
    label: 'Hindi (हिंदी)',
    flag: '🇮🇳',
    badge: 'Native',
    sample: 'नमस्ते! बीशावॉयस में आपका स्वागत है। यहाँ आप किसी भी हिंदी लेख को वास्तविक इंसानी आवाज़ में सुन सकते हैं।'
  },
  {
    id: 'en',
    label: 'English (Global/Indian Accent)',
    flag: '🌐',
    badge: 'Global',
    sample: 'Welcome to BhashaVoice! Experience high quality, human-like voice synthesis with zero limits and instant generation.'
  }
];

export const SAMPLE_SCRIPTS: Record<Language, { title: string; category: string; text: string }[]> = {
  auto: [
    {
      title: 'Multilingual Reel',
      category: 'Auto Switch',
      text: 'Hey friends! Aaj hum ek bohot hi amazing product review karne wale hain. यह प्रोडक्ट आपके काम को 10x आसान बना देगा। Let us dive straight into the features!'
    },
    {
      title: 'Global Tech Demo',
      category: 'Auto Switch',
      text: 'Welcome to the future of AI. BhashaVoice support karta hai multilingual speech synthesis. आप हिंदी, English, या Hinglish किसी भी भाषा में टाइप कर सकते हैं!'
    }
  ],
  hinglish: [
    {
      title: 'YouTube / Reel Intro',
      category: 'Creator',
      text: 'Hey guys, welcome back to another video! Aaj hum baat karne wale hain India ke top tech innovations ke baare mein. Video ko end tak zaroor dekhna aur agar accha lage toh like aur subscribe karna mat bhoolna!'
    },
    {
      title: 'Podcast Dialogue',
      category: 'Podcast',
      text: 'Ek baat bolo bhai, success ka koi shortcut nahi hota. Jab tak tum mehnat nahi karoge, tab tak results nahi milenge. Mindset change karo, life apne aap change ho jayegi.'
    },
    {
      title: 'Motivational Story',
      category: 'Motivation',
      text: 'Jab bhi life mein lage ki sab kharab ho raha hai, bas ek baar ruk kar socho. Har badi problem ke peeche ek bohot bada lesson hota hai. Stand up, fight back, and win!'
    }
  ],
  hi: [
    {
      title: 'कहानी और ज्ञान',
      category: 'कहानी',
      text: 'एक प्राचीन नगर में एक समझदार गुरु रहते थे। वे हमेशा कहते थे कि जीवन की सबसे बड़ी पूंजी हमारा ज्ञान और हमारा व्यवहार है। जो इंसान दूसरों की मदद करता है, उसका मार्ग स्वतः ही प्रकाशित हो जाता है।'
    },
    {
      title: 'समाचार एवं सूचना',
      category: 'समाचार',
      text: 'नमस्कार, मुख्य समाचारों में आपका स्वागत है। आज देश भर में तकनीकी नवाचारों को बढ़ावा देने के लिए नए अभियानों की शुरुआत की गई है। युवाओं में इसके प्रति भारी उत्साह देखा जा रहा है।'
    },
    {
      title: 'ध्यान एवं शांति',
      category: 'मेडिटेशन',
      text: 'धीरे से अपनी आँखें बंद करें। एक लंबी और गहरी सांस लें। अपने मन के सभी तनावों को बाहर निकलने दें। शांति और सकारात्मकता का अनुभव करें।'
    }
  ],
  en: [
    {
      title: 'Product Demonstration',
      category: 'Business',
      text: 'Introducing the future of voice technology. With our advanced AI model, you can now generate crisp, human-grade audio in seconds for videos, presentations, and audiobooks.'
    },
    {
      title: 'Tech Explanation',
      category: 'Education',
      text: 'Artificial Intelligence has reshaped how we consume digital content. By analyzing linguistic nuances, speech synthesis engines can reproduce natural inflection, emotion, and rhythm.'
    },
    {
      title: 'Inspirational Speech',
      category: 'Motivation',
      text: 'Every master was once a beginner. Do not be afraid to take that first step into the unknown. Passion, perseverance, and dedication are the only keys you will ever need.'
    }
  ]
};
