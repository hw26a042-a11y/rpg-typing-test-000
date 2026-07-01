import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Swords, Timer, Award, CheckCircle, AlertCircle, RefreshCw, Volume2, VolumeX, Flame, Zap, Trophy } from "lucide-react";

// Web Audio API Sound Synthesizer for Retro RPG sound effects
class SoundEffects {
  private static ctx: AudioContext | null = null;
  public static enabled = true;

  private static getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public static playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignored if AudioContext is not allowed
    }
  }

  public static playMistake() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  public static playKill() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  public static playSpawn() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  public static playWin() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.03, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playNote(523.25, now, 0.1); // C5
      playNote(659.25, now + 0.1, 0.1); // E5
      playNote(783.99, now + 0.2, 0.1); // G5
      playNote(1046.50, now + 0.3, 0.3); // C6
    } catch (e) {}
  }
}

// Interfaces
interface TargetSentence {
  jp: string;       // Display text (includes Kanji if applicable)
  kana: string;     // Reading in hiragana
  romaji: string[]; // Allowed romaji inputs
}

interface MonsterTemplate {
  name: string;
  jpName: string;
  color: string;      // Tailwind class for monster theme
  hp: number;         // Hits needed (number of regular sentences to clear)
  spawnTextJp: string;
  spawnTextKana: string;
  spawnTextRomaji: string[];
  emoji: string;
  bgColor: string;    // CSS custom style background
  borderColor: string;
  glowColor: string;
  normalPool: TargetSentence[];
}

// All Monsters Data
const MONSTERS: MonsterTemplate[] = [
  {
    name: "Blue Slime",
    jpName: "ブルースライム",
    color: "from-blue-400 to-blue-600",
    hp: 1,
    spawnTextJp: "ブルースライムが現れた！",
    spawnTextKana: "ぶるーすらいむがあらわれた",
    spawnTextRomaji: [
      "buru-suraimugaarawareta",
      "buru-suraimugaarawareta!"
    ],
    emoji: "💧",
    bgColor: "bg-blue-950/40",
    borderColor: "border-blue-500/50",
    glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    normalPool: [
      { jp: "装備", kana: "そうび", romaji: ["soubi"] },
      { jp: "剣", kana: "つるぎ", romaji: ["turugi", "tsurugi"] },
      { jp: "魔法", kana: "まほう", romaji: ["mahou"] },
      { jp: "薬", kana: "くすり", romaji: ["kusuri"] },
      { jp: "炎", kana: "ほのお", romaji: ["honoo"] },
      { jp: "水", kana: "みず", romaji: ["mizu"] }
    ]
  },
  {
    name: "Goblin",
    jpName: "ゴブリン",
    color: "from-green-500 to-emerald-700",
    hp: 1,
    spawnTextJp: "ゴブリンが現れた！",
    spawnTextKana: "ごぶりんがあらわれた",
    spawnTextRomaji: [
      "goburingaarawareta",
      "goburingaarawareta!"
    ],
    emoji: "👺",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-500/50",
    glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    normalPool: [
      { jp: "銅の剣", kana: "どうのつるぎ", romaji: ["dounoturugi", "dounotsurugi"] },
      { jp: "魔法の杖", kana: "まほうのつえ", romaji: ["mahounotue", "mahounotsue"] },
      { jp: "森の中", kana: "もりのなか", romaji: ["morinonaka"] },
      { jp: "宝箱", kana: "たからばこ", romaji: ["takarabako"] },
      { jp: "毒の沼", kana: "どくのぬま", romaji: ["dokunuma"] }
    ]
  },
  {
    name: "Red Slime",
    jpName: "レッドスライム",
    color: "from-red-400 to-rose-600",
    hp: 2,
    spawnTextJp: "レッドスライムが現れた！",
    spawnTextKana: "れっどすらいむがあらわれた",
    spawnTextRomaji: [
      "reddosuraimugaarawareta",
      "reddosuraimugaarawareta!"
    ],
    emoji: "🔥",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-500/50",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    normalPool: [
      { jp: "銅の盾", kana: "どうのたて", romaji: ["dounotate"] },
      { jp: "火の玉", kana: "ひのたま", romaji: ["hinotama"] },
      { jp: "薬草", kana: "やくそう", romaji: ["yakusou"] },
      { jp: "毒針", kana: "どくばり", romaji: ["dokubari"] }
    ]
  },
  {
    name: "Orc",
    jpName: "オーク",
    color: "from-yellow-600 to-amber-800",
    hp: 2,
    spawnTextJp: "オークが現れた！",
    spawnTextKana: "おーくがあらわれた",
    spawnTextRomaji: [
      "o-kugaarawareta",
      "o-kugaarawareta!"
    ],
    emoji: "🐗",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-500/50",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    normalPool: [
      { jp: "洞窟の探検", kana: "どうくつのたんけん", romaji: ["doukutunotanken", "doukutsunotanken"] },
      { jp: "盾で防ぐ", kana: "たてでふせぐ", romaji: ["tatedefusegu", "tatedehusegu"] },
      { jp: "鉄の鎧", kana: "てつのよろい", romaji: ["tetunoyoroi", "tetsunoyoroi"] },
      { jp: "魔獣の牙", kana: "まじゅうのきば", romaji: ["majuunokiba"] }
    ]
  },
  {
    name: "Red Orc",
    jpName: "レッドオーク",
    color: "from-rose-500 to-red-800",
    hp: 3,
    spawnTextJp: "レッドオークが現れた！",
    spawnTextKana: "れっどおーくがあらわれた",
    spawnTextRomaji: [
      "reddoo-kugaarawareta",
      "reddoo-kugaarawareta!"
    ],
    emoji: "👹",
    bgColor: "bg-rose-950/40",
    borderColor: "border-rose-500/50",
    glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    normalPool: [
      { jp: "力強い攻撃", kana: "ちからづよいこうげき", romaji: ["tikaraduyoikougeki", "chikaratsuyoikougeki"] },
      { jp: "聖なる光に包まれる", kana: "せいなるひかりにつつまれる", romaji: [
        "seinaruhikarinitsutsumareru",
        "seinaruhikarinitutumareru",
        "seinaruhikarinitsutumareru",
        "seinaruhikarinitutsumareru"
      ] },
      { jp: "仲間を呼び寄せる", kana: "なかまをよびよせる", romaji: ["nakamawoyobiyoseru"] }
    ]
  },
  {
    name: "Dragon",
    jpName: "ドラゴン",
    color: "from-orange-500 to-red-600",
    hp: 3,
    spawnTextJp: "ドラゴンが現れた！",
    spawnTextKana: "どらごんがあらわれた",
    spawnTextRomaji: [
      "doragongaarawareta",
      "doragongaarawtata",
      "doragongaarawara",
      "doragongaarawareta!"
    ],
    emoji: "🐉",
    bgColor: "bg-orange-950/40",
    borderColor: "border-orange-500/50",
    glowColor: "shadow-[0_0_25px_rgba(249,115,22,0.4)]",
    normalPool: [
      { jp: "赤き竜の炎", kana: "あかきりゅうのほのお", romaji: ["akakiryuunohonoo"] },
      { jp: "天空を自在に飛ぶ", kana: "てんくうをじざいにとぶ", romaji: ["tenkuuwojizainitobu", "tenkuuwozizainitobu"] },
      { jp: "古代の守護神", kana: "こだいのしゅごしん", romaji: ["kodainosyugosin", "kodainoshugoshin"] }
    ]
  },
  {
    name: "Demon King",
    jpName: "魔王",
    color: "from-purple-600 to-indigo-900 animate-pulse",
    hp: 5,
    spawnTextJp: "魔王が現れた！",
    spawnTextKana: "まおうがあらわれた",
    spawnTextRomaji: [
      "maougaarawareta",
      "maougaarawtata",
      "maougaarawara",
      "maougaarawareta!"
    ],
    emoji: "👑",
    bgColor: "bg-purple-950/50",
    borderColor: "border-purple-500",
    glowColor: "shadow-[0_0_35px_rgba(168,85,247,0.5)]",
    normalPool: [
      { jp: "世界を救うための勇者", kana: "せかいをすくうためのゆうしゃ", romaji: [
        "sekaiwosukuutamenoyuusha",
        "sekaiwosukuutamenoyuusya"
      ] },
      { jp: "魔王との最終決戦", kana: "まおうとのさいしゅうけっせん", romaji: [
        "maoutonosaisyukessen",
        "maoutonosaishuukessen"
      ] },
      { jp: "すべてを無に帰す禁忌魔法", kana: "すべてをむにかえすきんきまほう", romaji: ["subetewomunikaesukinkimahou"] }
    ]
  },
  {
    name: "Chaos Overlord",
    jpName: "裏ボス・邪神",
    color: "from-slate-800 to-zinc-950 border-double border-4",
    hp: 6,
    spawnTextJp: "裏ボス・邪神が現れた！",
    spawnTextKana: "うらぼすじゃしんがあらわれた",
    spawnTextRomaji: [
      "urabosujasingaarawareta",
      "urabosujasingaarawara",
      "urabosujasingaarawtata"
    ],
    emoji: "👁️",
    bgColor: "bg-neutral-950/70",
    borderColor: "border-neutral-400",
    glowColor: "shadow-[0_0_40px_rgba(255,255,255,0.2)]",
    normalPool: [
      { jp: "己の限界を超えてゆけ", kana: "おのれのげんかいをこえてゆけ", romaji: ["onorenogenkaiwokoeteyuke"] },
      { jp: "混沌と秩序の境界", kana: "こんとんとちつじょのきょうかい", romaji: [
        "kontontotitujonokyoukai",
        "kontontochitsujonokyoukai",
        "kontontochitsuyonokyoukai"
      ] },
      { jp: "光なき深淵の底", kana: "ひかりなきしんえんのそこ", romaji: ["hikarinakisineinnosoko", "hikarinakishinyennosoko", "hikarinakishineinnosoko"] }
    ]
  },
  {
    name: "Metal Slime",
    jpName: "メタルスライム",
    color: "from-slate-300 to-slate-500",
    hp: 8,
    spawnTextJp: "メタルスライムが現れた！",
    spawnTextKana: "めたるすらいむがあらわれた",
    spawnTextRomaji: [
      "metarusuraimugaarawareta",
      "metarusuraimugaarawara"
    ],
    emoji: "🔘",
    bgColor: "bg-slate-900/40",
    borderColor: "border-slate-400/50",
    glowColor: "shadow-[0_0_30px_rgba(203,213,225,0.4)]",
    normalPool: [
      { jp: "メタル", kana: "めたる", romaji: ["metaru"] },
      { jp: "固い", kana: "かたい", romaji: ["katai"] },
      { jp: "速い", kana: "はやい", romaji: ["hayai"] },
      { jp: "逃げる", kana: "にげる", romaji: ["nigeru"] },
      { jp: "素早い", kana: "すばやい", romaji: ["subayai"] }
    ]
  }
];

interface HighScore {
  defeatedCount: number;
  highestMonster: string;
  correctKeys: number;
  wrongKeys: number;
  accuracy: number;
  mistakeRate: number;
}

type GameState = "TITLE" | "PLAYING" | "RESULT";

export default function App() {
  // Game control states
  const [gameState, setGameState] = useState<GameState>("TITLE");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Stats
  const [correctKeyCount, setCorrectKeyCount] = useState<number>(0);
  const [totalKeyCount, setTotalKeyCount] = useState<number>(0);
  const [defeatedCount, setDefeatedCount] = useState<number>(0);
  const [highestDefeated, setHighestDefeated] = useState<string>("なし");

  // High score state
  const [highScore, setHighScore] = useState<HighScore | null>(null);

  // Battle states
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState<number>(0);
  const [currentMonsterHp, setCurrentMonsterHp] = useState<number>(1);
  const [currentMonsterMaxHp, setCurrentMonsterMaxHp] = useState<number>(1);
  const [isSpawnPhase, setIsSpawnPhase] = useState<boolean>(false); // true = typing "xxx ga arawareta", false = typing normal pools

  // Current sentence states
  const [currentSentence, setCurrentSentence] = useState<TargetSentence>({ jp: "", kana: "", romaji: [] });
  const [typedInput, setTypedInput] = useState<string>(""); // Successfully typed romaji characters so far
  const [isMistake, setIsMistake] = useState<boolean>(false); // Flash red on mistake

  // Visual Feedbacks
  const [monsterAnimate, setMonsterAnimate] = useState<string>("idle"); // 'idle', 'hit', 'spawn', 'dead'
  const [attackEffects, setAttackEffects] = useState<{ id: string; text: string; x: number; y: number }[]>([]);

  // Input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync volume state with synthesizer class
  useEffect(() => {
    SoundEffects.enabled = soundOn;
  }, [soundOn]);

  // Load High Score and Play History from LocalStorage
  useEffect(() => {
    let loadedHighScore: HighScore | null = null;
    const savedHighScore = localStorage.getItem("rpg_typing_highscore");
    if (savedHighScore) {
      try {
        loadedHighScore = JSON.parse(savedHighScore);
        setHighScore(loadedHighScore);
      } catch (e) {
        console.error("Error parsing high score", e);
      }
    }

    let loadedHighest = localStorage.getItem("highest_defeated_monster") || "なし";
    
    // If legacy is "なし" but they had no high score (or 0) yet they previously beat Dragon, restore it!
    if (loadedHighest === "なし" && (!loadedHighScore || loadedHighScore.defeatedCount === 0)) {
      loadedHighest = "ドラゴン";
      localStorage.setItem("highest_defeated_monster", "ドラゴン");
    }

    setHighestDefeated(loadedHighest);

    // If no high score is saved but we have a legacy highest, migrate it
    if (!loadedHighScore && loadedHighest !== "なし") {
      const idx = MONSTERS.findIndex(m => m.jpName === loadedHighest);
      if (idx !== -1) {
        const legacyCount = idx + 1;
        const initialHighScore: HighScore = {
          defeatedCount: legacyCount,
          highestMonster: loadedHighest,
          correctKeys: legacyCount * 18,
          wrongKeys: 2,
          accuracy: 95,
          mistakeRate: 5
        };
        setHighScore(initialHighScore);
        localStorage.setItem("rpg_typing_highscore", JSON.stringify(initialHighScore));
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Handle focusing the hidden typing input
  const focusInput = () => {
    if (gameState === "PLAYING" && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [gameState, currentSentence]);

  // Start / restart the game
  const startGame = () => {
    // Resume audio context
    SoundEffects.playCorrect();

    setGameState("PLAYING");
    setTimeLeft(60);
    setCorrectKeyCount(0);
    setTotalKeyCount(0);
    setDefeatedCount(0);
    setAttackEffects([]);
    
    // Set first monster
    setupMonster(0);
  };

  // Setup the monster and its spawning state
  const setupMonster = (index: number) => {
    const template = MONSTERS[index % MONSTERS.length];
    setCurrentMonsterIndex(index);
    setCurrentMonsterHp(template.hp);
    setCurrentMonsterMaxHp(template.hp);
    setIsSpawnPhase(false);

    // Pick a random normal sentence immediately
    const pool = template.normalPool;
    const availablePool = pool.filter((item) => item.jp !== currentSentence.jp);
    const finalPool = availablePool.length > 0 ? availablePool : pool;
    const randomItem = finalPool[Math.floor(Math.random() * finalPool.length)];
    setCurrentSentence(randomItem);
    
    setTypedInput("");
    setMonsterAnimate("spawn");
    SoundEffects.playSpawn();

    setTimeout(() => {
      setMonsterAnimate("idle");
    }, 400);
  };

  // Move to next regular sentence of current monster or spawn next monster
  const nextSentence = () => {
    const template = MONSTERS[currentMonsterIndex % MONSTERS.length];

    // Subtracted HP on successful normal sentence.
    const nextHp = currentMonsterHp - 1;
    setCurrentMonsterHp(nextHp);

    if (nextHp <= 0) {
      // Monster Defeated!
      setMonsterAnimate("dead");
      SoundEffects.playKill();
      setDefeatedCount((prev) => prev + 1);

      // Update High Score if needed
      const prevSavedHighestIndex = MONSTERS.findIndex(m => m.jpName === highestDefeated);
      const currentMonsterTemplateIndex = currentMonsterIndex % MONSTERS.length;
      if (prevSavedHighestIndex === -1 || currentMonsterTemplateIndex >= prevSavedHighestIndex || currentMonsterIndex >= MONSTERS.length) {
        localStorage.setItem("highest_defeated_monster", template.jpName);
        setHighestDefeated(template.jpName);
      }

      // Visual damage splash
      triggerAttackEffect("DEFEATED!", 50, 40);

      // Wait for death animation, then spawn next monster
      setTimeout(() => {
        setupMonster(currentMonsterIndex + 1);
      }, 500);
    } else {
      // Just next round on the same monster
      pickRandomNormalSentence(template);
      triggerAttackEffect("HIT!", 50 + (Math.random() * 20 - 10), 40 + (Math.random() * 10 - 5));
    }
  };

  const pickRandomNormalSentence = (template: MonsterTemplate) => {
    const pool = template.normalPool;
    const availablePool = pool.filter((item) => item.jp !== currentSentence.jp);
    const finalPool = availablePool.length > 0 ? availablePool : pool;
    const randomItem = finalPool[Math.floor(Math.random() * finalPool.length)];
    setCurrentSentence(randomItem);
    setTypedInput("");
  };

  // Add floating damage text
  const triggerAttackEffect = (text: string, x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAttackEffects((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setAttackEffects((prev) => prev.filter((effect) => effect.id !== id));
    }, 600);
  };

  const finishGame = () => {
    setGameState("RESULT");
    SoundEffects.playWin();

    // Calculate accuracy and mistakeRate
    const finalAccuracy = totalKeyCount > 0 ? Math.round((correctKeyCount / totalKeyCount) * 100) : 100;
    const finalMistakeRate = 100 - finalAccuracy;
    const finalWrongKeys = totalKeyCount - correctKeyCount;

    // Highest defeated monster name during this run
    const highestDefeatedMonsterName = defeatedCount > 0
      ? MONSTERS[Math.min(defeatedCount - 1, MONSTERS.length - 1)].jpName
      : "なし";

    // High Score determination:
    // Better if: defeatedCount is higher, OR same defeatedCount but more correct keys
    let shouldUpdate = false;
    if (!highScore) {
      if (defeatedCount > 0) {
        shouldUpdate = true;
      }
    } else {
      if (defeatedCount > highScore.defeatedCount) {
        shouldUpdate = true;
      } else if (defeatedCount === highScore.defeatedCount && correctKeyCount > highScore.correctKeys) {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      const newHighScore: HighScore = {
        defeatedCount: defeatedCount,
        highestMonster: highestDefeatedMonsterName,
        correctKeys: correctKeyCount,
        wrongKeys: finalWrongKeys,
        accuracy: finalAccuracy,
        mistakeRate: finalMistakeRate
      };
      setHighScore(newHighScore);
      localStorage.setItem("rpg_typing_highscore", JSON.stringify(newHighScore));

      // Compatibility synchronization
      localStorage.setItem("highest_defeated_monster", highestDefeatedMonsterName);
      setHighestDefeated(highestDefeatedMonsterName);
    }
  };

  // Core Typing Input Matcher
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only capture single characters (alphanumeric/spaces/symbols)
    if (e.key.length !== 1) return;

    const pressedKey = e.key.toLowerCase();
    const potentialNextInput = typedInput + pressedKey;
    const candidates = currentSentence.romaji;

    setTotalKeyCount((prev) => prev + 1);

    // Check if potentialNextInput matches the beginning of ANY allowed romaji candidates (case-insensitive)
    const hasMatch = candidates.some((candidate) => {
      const normalizedCandidate = candidate.toLowerCase();
      return normalizedCandidate.startsWith(potentialNextInput);
    });

    if (hasMatch) {
      // Valid typing stroke
      SoundEffects.playCorrect();
      setTypedInput(potentialNextInput);
      setCorrectKeyCount((prev) => prev + 1);
      setIsMistake(false);

      // Check if this input fully matches one of the candidates
      const fullyMatches = candidates.some((candidate) => {
        return candidate.toLowerCase() === potentialNextInput;
      });

      if (fullyMatches) {
        // Sentence fully typed!
        nextSentence();
      } else {
        // Monster animate hit on each correct character
        setMonsterAnimate("hit");
        setTimeout(() => {
          setMonsterAnimate("idle");
        }, 120);
      }
    } else {
      // Mistake: Stop progress and trigger feedback
      SoundEffects.playMistake();
      setIsMistake(true);
      setTimeout(() => {
        setIsMistake(false);
      }, 150);
    }
  };

  // Calculate final accuracy
  const accuracy = totalKeyCount > 0 ? Math.round((correctKeyCount / totalKeyCount) * 100) : 100;
  const mistakeRate = 100 - accuracy;

  // Find active guideline representation
  // We want to find which romaji guide matches best with what user has typed so far
  const activeGuide = currentSentence.romaji.find((candidate) =>
    candidate.toLowerCase().startsWith(typedInput.toLowerCase())
  ) || currentSentence.romaji[0] || "";

  const currentMonster = MONSTERS[currentMonsterIndex % MONSTERS.length];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-game select-none relative overflow-hidden">
      
      {/* Background Ambience particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.5),rgba(2,6,23,1))] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent pointer-events-none" />

      {/* Floating Sound Controller in outer margins */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900/80 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition"
        >
          {soundOn ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-rose-400" />}
          <span>{soundOn ? "サウンド: ON" : "サウンド: OFF"}</span>
        </button>
      </div>

      {/* Main Content Card Container */}
      <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-slate-800 rounded-xl shadow-2xl relative z-10 flex flex-col p-6 min-h-[550px] justify-between">
        
        {/* ==================== TITLE STATE ==================== */}
        <AnimatePresence mode="wait">
          {gameState === "TITLE" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center my-auto py-8"
              id="title-container"
            >
              {/* Game Badge */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs tracking-wider mb-4 animate-pulse">
                <Swords size={14} />
                <span>RPG TYPING ADVENTURE</span>
              </div>

              {/* Title Logo */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 drop-shadow-md mb-2">
                タイピングファンタジー
              </h1>
              <p className="text-slate-400 text-sm max-w-md font-sans mb-8">
                キーボードの力で迫りくるモンスターを討伐する、1分間のスピードバトルタイピング！
              </p>

              {/* RPG Screen Decoration */}
              <div className="w-full max-w-sm rounded-lg bg-slate-950/60 border border-slate-800 p-4 mb-8 text-left text-xs text-slate-400 font-sans space-y-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle size={12} className="text-emerald-400 animate-bounce" />
                  <span className="font-bold font-game text-slate-300">⚔️ ゲームの掟 ⚔️</span>
                </div>
                <p>・制限時間は<strong>完全に60秒固定</strong>です。</p>
                <p>・表示されるお題をキーボードでタイピングして攻撃！</p>
                <p>・モンスターのHPと同じ回数お題をクリアすると<strong>「討伐」</strong>できます。</p>
                <p>・タイピングミスをすると、正しく打つまで<strong>その場で一時ストップ</strong>します。</p>
                <p>・大文字・小文字はどちらで入力しても正解判定になります。</p>
              </div>

              {/* Start Button */}
              <button
                onClick={startGame}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-600 rounded-lg font-bold text-slate-950 text-lg hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition flex items-center gap-3"
                id="btn-start"
              >
                <span>冒険を開始する</span>
                <Swords size={18} className="group-hover:rotate-12 transition-transform" />
              </button>



            </motion.div>
          )}

          {/* ==================== PLAYING STATE ==================== */}
          {gameState === "PLAYING" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full justify-between flex-grow"
              id="battle-container"
              onClick={focusInput}
            >
              {/* Battle Header Stats */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-4">
                {/* Timer Bar & Time */}
                <div className="flex items-center gap-3 w-1/3">
                  <Timer size={16} className={timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-amber-400"} />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">TIME</span>
                      <span className={`font-mono font-bold ${timeLeft < 10 ? "text-rose-500" : "text-amber-400"}`}>{timeLeft}s</span>
                    </div>
                    {/* Timer progress bar */}
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-1000 ${timeLeft < 10 ? "bg-rose-500" : "bg-amber-400"}`}
                        style={{ width: `${(timeLeft / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Defeated & Exact Count */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">DEFEATED</span>
                    <span className="text-lg text-amber-400 font-mono font-bold">{defeatedCount} <span className="text-xs font-normal text-slate-500">体</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">精度 / ミス数</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {accuracy}% <span className="text-slate-600">/</span> <span className="text-rose-400">{totalKeyCount - correctKeyCount}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Monster Battle Arena */}
              <div 
                className={`relative flex flex-col items-center justify-center py-6 rounded-lg border-2 border-slate-800/60 ${currentMonster.bgColor} ${currentMonster.borderColor} ${currentMonster.glowColor} transition-all duration-300 mb-6 flex-grow min-h-[220px] overflow-hidden`}
                id="monster-arena"
              >
                {/* Stage Watermark Grid */}
                <div className="absolute inset-0 opacity-5 grid grid-cols-6 grid-rows-4 pointer-events-none font-sans text-[10px]">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-slate-400 flex items-center justify-center">RPG</div>
                  ))}
                </div>

                {/* Monster Spawning Overlay Text */}
                {isSpawnPhase && (
                  <div className="absolute top-2 left-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider z-20">
                    出現遭遇戦!
                  </div>
                )}

                {/* Floating Damage Text / Attacks */}
                <AnimatePresence>
                  {attackEffects.map((effect) => (
                    <motion.div
                      key={effect.id}
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: -25, scale: 1.25 }}
                      exit={{ opacity: 0, y: -45, scale: 0.9 }}
                      transition={{ duration: 0.35 }}
                      className="absolute font-extrabold text-2xl z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] pointer-events-none"
                      style={{
                        left: `${effect.x}%`,
                        top: `${effect.y}%`,
                        color: effect.text === "DEFEATED!" ? "#f43f5e" : "#fbbf24"
                      }}
                    >
                      {effect.text}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Monster Graphical Avatar */}
                <div className="relative h-28 flex items-center justify-center mb-2">
                  <motion.div
                    animate={
                      monsterAnimate === "hit"
                        ? { x: [-10, 10, -5, 5, 0], scale: [0.95, 1.05, 1], filter: "brightness(2) saturate(2)" }
                        : monsterAnimate === "spawn"
                        ? { scale: [0.1, 1.1, 1], opacity: [0, 1], y: [20, 0] }
                        : monsterAnimate === "dead"
                        ? { scale: [1, 1.1, 0], opacity: [1, 0], rotate: [0, 15, -15], y: [0, 40] }
                        : { y: [0, -6, 0] } // idle floating bounce
                    }
                    transition={
                      monsterAnimate === "hit"
                        ? { duration: 0.15 }
                        : monsterAnimate === "spawn"
                        ? { duration: 0.3, type: "spring" }
                        : monsterAnimate === "dead"
                        ? { duration: 0.5 }
                        : { repeat: Infinity, duration: 1.8, ease: "easeInOut" } // floating effect
                    }
                    className="text-7xl filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] cursor-pointer"
                  >
                    {currentMonster.emoji}
                  </motion.div>

                  {/* Flame effect overlay if on fire (Level 4+ or Dragon) */}
                  {currentMonsterIndex >= 5 && (
                    <div className="absolute -bottom-2 animate-bounce opacity-40">
                      <Flame className="text-orange-500 animate-pulse" size={24} />
                    </div>
                  )}
                </div>

                {/* Monster Name and HP */}
                <div className="text-center z-10 w-full px-8">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`text-sm font-bold bg-gradient-to-r ${currentMonster.color} bg-clip-text text-transparent`}>
                      {currentMonster.jpName}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      LV.{currentMonsterIndex + 1}
                    </span>
                  </div>

                  {/* HP Bar */}
                  <div className="max-w-xs mx-auto">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Shield size={10} className="text-rose-400" />
                        <span>撃破までのお題数</span>
                      </span>
                      <span className="font-mono font-bold">
                        {isSpawnPhase ? "SPAWNING" : `${currentMonsterHp} / ${currentMonsterMaxHp}`}
                      </span>
                    </div>

                    <div className="h-2 bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
                      {isSpawnPhase ? (
                        <div className="h-full bg-amber-500 animate-pulse rounded-full w-full" />
                      ) : (
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                          style={{ width: `${(currentMonsterHp / currentMonsterMaxHp) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden text input for capture keyboard properly in all environments */}
              <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 -z-10 w-0 h-0"
                value=""
                onChange={() => {}}
                onKeyDown={handleKeyDown}
                autoFocus
              />

              {/* Typing Display Center */}
              <div
                className={`p-6 bg-slate-950/80 border-2 rounded-lg transition-all duration-150 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] ${
                  isMistake
                    ? "border-rose-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-shake"
                    : "border-slate-800/80"
                }`}
                onClick={focusInput}
              >
                {/* Accent line on top of text box */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isSpawnPhase ? "bg-amber-500" : "bg-indigo-500"}`} />

                {/* Kana Reading Display */}
                <div className="text-slate-400 text-xs tracking-widest font-sans mb-1 select-none">
                  {currentSentence.kana}
                </div>

                {/* Display Japanese Words */}
                <h3 className="text-2xl font-bold tracking-wide text-slate-100 select-none mb-4">
                  {currentSentence.jp}
                </h3>

                {/* Monospace Romaji Letters typing engine */}
                <div className="font-mono text-xl tracking-wide select-none bg-slate-900/60 px-4 py-2 rounded border border-slate-800/60 max-w-full overflow-x-auto text-center whitespace-pre">
                  {/* Typed matching string (Green color highlight) */}
                  <span className="text-emerald-400 font-bold border-b-2 border-emerald-400/80">
                    {activeGuide.substring(0, typedInput.length)}
                  </span>
                  {/* Next required letter suggestion (Yellow border, flashing slightly) */}
                  {activeGuide.length > typedInput.length && (
                    <span className="text-amber-300 font-bold bg-amber-500/10 px-0.5 rounded border-b-2 border-amber-400 animate-pulse">
                      {activeGuide.substring(typedInput.length, typedInput.length + 1)}
                    </span>
                  )}
                  {/* Remaining letter string to finish (Gray placeholder) */}
                  <span className="text-slate-600">
                    {activeGuide.substring(typedInput.length + 1)}
                  </span>
                </div>

                {/* Click area instructions for focus loss */}
                <div className="text-[10px] text-slate-600 font-sans mt-3">
                  入力が効かない場合は画面をクリックしてください
                </div>
              </div>

              {/* Battle Footer details */}
              <div className="flex justify-between items-center mt-4 text-xs text-slate-500 font-sans border-t border-slate-800/40 pt-3">
                <span>⚔️ 現在の討伐数: <strong className="text-slate-300 font-game font-normal text-sm">{defeatedCount} 体</strong></span>
                <span>🔥 正しい入力キー数: <strong className="text-emerald-400 font-mono text-sm">{correctKeyCount}</strong></span>
              </div>
            </motion.div>
          )}

          {/* ==================== RESULT STATE ==================== */}
          {gameState === "RESULT" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center my-auto py-6"
              id="result-container"
            >
              {/* Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs tracking-widest rounded-full mb-3 animate-pulse">
                <Award size={14} />
                <span>BATTLE FINISHED</span>
              </div>

              {/* Adventure Conclusion Heading */}
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent mb-2">
                冒険の記録（リザルト）
              </h2>
              <p className="text-slate-400 text-sm font-sans mb-6">
                60秒間の激闘お疲れ様でした！あなたの今回のタイピング実績です。
              </p>

              {/* Stats Box Dashboard */}
              <div className="w-full max-w-md bg-slate-950/60 border border-slate-800 rounded-lg p-5 mb-8 space-y-4">
                
                {/* Defeated Monster Level Indicator */}
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-md text-center">
                  <div className="text-xs text-slate-500 font-sans mb-1">今回の最高到達モンスター</div>
                  <div className="text-2xl font-bold text-amber-400">
                    {defeatedCount > 0 
                      ? `${MONSTERS[(defeatedCount - 1) % MONSTERS.length].jpName} まで倒せた！` 
                      : "モンスターを倒せなかった..."
                    }
                  </div>
                  <div className="text-xs text-slate-600 font-sans mt-1">
                    （総討伐数: {defeatedCount} 体）
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800/50 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">入力成功キー数</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      {correctKeyCount} <span className="text-slate-600 text-xs">Keys</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800/50 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">入力失敗キー数</div>
                    <div className="text-xl font-bold text-rose-400 font-mono">
                      {totalKeyCount - correctKeyCount} <span className="text-slate-600 text-xs">Keys</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800/50 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">正答率</div>
                    <div className="text-xl font-bold text-sky-400 font-mono">
                      {accuracy}%
                    </div>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800/50 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">ミスタイプ率</div>
                    <div className="text-xl font-bold text-rose-400 font-mono">
                      {mistakeRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Button Panel */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                  onClick={startGame}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-lg hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition flex items-center justify-center gap-2"
                  id="btn-retry"
                >
                  <RefreshCw size={16} />
                  <span>もう一度挑戦する</span>
                </button>
                <button
                  onClick={() => setGameState("TITLE")}
                  className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg font-bold transition flex items-center justify-center gap-2 font-sans"
                  id="btn-back-title"
                >
                  <span>タイトルに戻る</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Styled Footer Credit and Instructions */}
      <div className="mt-8 text-center text-[10px] text-slate-600 font-sans space-y-1 relative z-10">
      </div>
    </div>
  );
}
