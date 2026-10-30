import { CROPS, CROP_BY_ID, type Crop } from "./catalogue";
import { monthName } from "./format";

export interface PlantingWindowRule {
  startMonth: number; // 1-12
  endMonth: number; // 1-12
  seasonType: "early" | "main" | "summer" | "late";
  seasonLabel: string; // e.g. "আগাম শীতকালীন", "গ্রীষ্মকালীন অফ-সিজন"
  growthMonths: number;
  growthDaysText: string;
  profitLevel: "ultra" | "high" | "moderate";
  profitBadge: string; // "সর্বোচ্চ লাভ (অফ-সিজন/আগাম)", "ভালো মুনাফা"
  strategyDescription: string;
  actionableTip: string;
}

export interface CropProfitProfile {
  cropId: string;
  crop: Crop;
  rules: PlantingWindowRule[];
  storageAdvice?: string;
}

export const CROP_PROFIT_RULES: Record<string, PlantingWindowRule[]> = {
  potato: [
    {
      startMonth: 10,
      endMonth: 10,
      seasonType: "early",
      seasonLabel: "আগাম রবি (নতুন আলু)",
      growthMonths: 2,
      growthDaysText: "৬০ – ৬৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (নতুন আলু)",
      strategyDescription: "অক্টোবরের ১ম-২য় সপ্তাহে আগাম বীজ আলু লাগালে ডিসেম্বরের শুরুতেই কচি নতুন আলু হিসেবে তোলা যায়।",
      actionableTip: "ডিসেম্বরে বাজারে যখন পুরোনো আলুর সংকট থাকে তখন নতুন আলু কেজিপ্রতি ৮০-১০০ টাকা দরে বিক্রি করে সাধারণের চেয়ে ৩ গুণ লাভ করা সম্ভব।"
    },
    {
      startMonth: 11,
      endMonth: 12,
      seasonType: "main",
      seasonLabel: "প্রধান মৌসুম",
      growthMonths: 3,
      growthDaysText: "৮৫ – ৯০ দিন",
      profitLevel: "moderate",
      profitBadge: "হিমাগারে সংরক্ষণ সাপেক্ষে লাভ",
      strategyDescription: "নভেম্বর-ডিসেম্বরের রোপণে ফেব্রুয়ারি-মার্চে বাম্পার ফলন হয়, কিন্তু বাজারে আলু ভরপুর থাকায় দাম কম (২৫-৩০ টাকা) থাকে।",
      actionableTip: "মার্চে না বেচে সরাসরি হিমাগারে রেখে সেপ্টেম্বর-নভেম্বর মাসে বিক্রি করলে কেজিপ্রতি ১৫-২৫ টাকা অতিরিক্ত মুনাফা নিশ্চিত হয়।"
    }
  ],
  tomato: [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম শীতকালীন",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৭৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আগাম বাজার)",
      strategyDescription: "ভাদ্র-আশ্বিন মাসে উঁচু বেডে পলিথিন মালচিং করে আগাম চারা রোপণ করলে কার্তিক-অগ্রহায়ণে (নভেম্বর) টমেটো ওঠে।",
      actionableTip: "নভেম্বর-ডিসেম্বরে বাজারে নতুন টমেটো উঠলে প্রতি কেজি ১২০-১৫০ টাকায় বিক্রি করা যায়, যা ভরা মৌসুমের তুলনায় ৪-৫ গুণ বেশি।"
    },
    {
      startMonth: 4,
      endMonth: 5,
      seasonType: "summer",
      seasonLabel: "গ্রীষ্মকালীন অফ-সিজন",
      growthMonths: 2.5,
      growthDaysText: "৭৫ – ৮০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (অফ-সিজন)",
      strategyDescription: "বৈশাখ-জ্যৈষ্ঠে পলিটানেলে বারি টমেটো-৮ বা বারি টমেটো-১৪ চাষ করলে শ্রাবণ-ভাদ্র (জুলাই-আগস্ট) মাসে ফলন আসে।",
      actionableTip: "গ্রীষ্ম ও বর্ষায় বাজারে দেশি টমেটোর মারাত্মক আকাল থাকে, ফলে কেজিপ্রতি ১০০-১৪০ টাকা অনায়াসে পাওয়া যায়।"
    },
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "প্রধান শীতকালীন",
      growthMonths: 3,
      growthDaysText: "৮৫ – ৯০ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক ফলন",
      strategyDescription: "কার্তিক-অগ্রহায়ণে রোপণ করলে জানুয়ারি-ফেব্রুয়ারিতে ফসল ওঠে যখন দাম নেমে ২০-২৫ টাকায় দাঁড়ায়।",
      actionableTip: "ফেব্রুয়ারিতে দাম কমলে কাঁচা বিক্রির বদলে টমেটো পিউরি বা সস প্রস্তুতের জন্য বিক্রি করলে লোকসান এড়ানো যায়।"
    }
  ],
  "green-chilli": [
    {
      startMonth: 3,
      endMonth: 4,
      seasonType: "summer",
      seasonLabel: "গ্রীষ্ম ও বর্ষাকালীন অফ-সিজন",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৭৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (বর্ষার চড়া বাজার)",
      strategyDescription: "চৈত্র-বৈশাখ মাসে উঁচু জমিতে প্লাস্টিক মালচিং দিয়ে মরিচের চারা রোপণ করলে আষাঢ়-আশ্বিনে (জুলাই-সেপ্টেম্বর) নিয়মিত ফলন পাওয়া যায়।",
      actionableTip: "বর্ষায় বন্যায় নিচু এলাকার মরিচ ডুবে গেলে বাজারে তীব্র সংকট তৈরি হয় এবং দাম কেজিপ্রতি ১৮০-৩০০ টাকা পর্যন্ত ওঠে।"
    },
    {
      startMonth: 9,
      endMonth: 10,
      seasonType: "main",
      seasonLabel: "শীতকালীন মৌসুম",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৮০ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "আশ্বিন-কার্তিকে লাগালে পৌষ-মাঘে (ডিসেম্বর-জানুয়ারি) ফলন আসে এবং দীর্ঘ কয়েক মাস মরিচ তোলা যায়।",
      actionableTip: "শীতের মাঝামাঝি কাঁচা মরিচের দাম কিছুটা কমলে পাকা মরিচ শুকিয়ে শুকনা মরিচ হিসেবে সংরক্ষণ করুন।"
    }
  ],
  eggplant: [
    {
      startMonth: 12,
      endMonth: 1,
      seasonType: "early",
      seasonLabel: "রমজান টার্গেটেড চাষ",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৭৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (রমজান বাজার)",
      strategyDescription: "পৌষ-মাঘে বেগুন চারা রোপণ করলে চৈত্র-বৈশাখ (মার্চ-এপ্রিল) রমজানের শুরুতে বড় আকারের চকচকে বেগুন তোলা যায়।",
      actionableTip: "রমজানে বেগুনি তৈরির জন্য লম্বা ও গোল বেগুনের চাহিদা চরমে পৌঁছায়, দাম কেজিপ্রতি ৮০-১২০ টাকা পর্যন্ত ওঠে।"
    },
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "main",
      seasonLabel: "আগাম শীতকালীন",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৮০ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "ভাদ্র-আশ্বিনে চারা লাগালে কার্তিকের শুরুতে শীতের সবজির চড়া দামে কেজিপ্রতি ৬০-৮০ টাকায় বিক্রি করা যায়।",
      actionableTip: "সেক্স ফেরোমোন ফাঁদ ব্যবহার করলে পোকার আক্রমণ কমে এবং বিষমুক্ত বেগুন হিসেবে প্রিমিয়াম দর মেলে।"
    }
  ],
  cabbage: [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম শীতকালীন",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৭৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আগাম বাজার)",
      strategyDescription: "ভাদ্রে বীজতলায় চারা তৈরি করে আশ্বিনের শুরুতে মাঠে রোপণ করলে অগ্রহায়ণে (নভেম্বর) আগাম বাঁধাকপি বাজারে ওঠে।",
      actionableTip: "নভেম্বরের আগাম বাঁধাকপি প্রতি পিস ৫০-৭০ টাকায় বিক্রি হয়, অথচ জানুয়ারির ভরা মৌসুমে তা নেমে আসে ১৫-২০ টাকায়।"
    },
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "নিয়মিত শীতকালীন",
      growthMonths: 3,
      growthDaysText: "৮০ – ৯০ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক লাভ",
      strategyDescription: "কার্তিক-অগ্রহায়ণে রোপণ করলে জানুয়ারি-ফেব্রুয়ারিতে বড় সাইজের ফুল ফলন মেলে।",
      actionableTip: "একসাথে সব না তুলে ধাপে ধাপে জমি খালি করে পরবর্তী ফসল আবাদের পরিকল্পনা করুন।"
    }
  ],
  cauliflower: [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "অতি আগাম ফুলকপি",
      growthMonths: 2,
      growthDaysText: "৬০ – ৬৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (দ্বিগুণ-তিনগুণ দাম)",
      strategyDescription: "উষ্ণ সহনশীল জাত (যেমন: সামার হোয়াইট বা স্নো হোয়াইট) ভাদ্রের শুরুতে রোপণ করলে কার্তিক মাসে বাজারে ফুলকপি পাওয়া যায়।",
      actionableTip: "অক্টোবর-নভেম্বরে বাজারে প্রথম ফুলকপি প্রতি পিস ৬০-৮০ টাকায় বিক্রি হয়, যা সর্বোচ্চ মুনাফার সেরা সুযোগ।"
    },
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "প্রধান শীতকালীন",
      growthMonths: 2.5,
      growthDaysText: "৭৫ – ৮৫ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক লাভ",
      strategyDescription: "কার্তিক-অগ্রহায়ণের রোপণে জানুয়ারি-ফেব্রুয়ারিতে প্রচুর ফুলকপি ওঠে এবং দর ১৫-২৫ টাকায় নামে।",
      actionableTip: "সাদা রং অক্ষুণ্ণ রাখতে পাতা ভেঙে ফুল ঢেকে রাখুন (ব্ল্যাঞ্চিং), এতে বাজারে দ্রুত ও ভালো দামে বিক্রি হয়।"
    }
  ],
  bean: [
    {
      startMonth: 6,
      endMonth: 7,
      seasonType: "early",
      seasonLabel: "অতি আগাম শিম",
      growthMonths: 3,
      growthDaysText: "৯০ – ১০০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আগাম বাজার)",
      strategyDescription: "আষাঢ়-শ্রাবণে অটো বা ইপসা জাতের আগাম শিম রোপণ করলে আশ্বিন-কার্তিকে (সেপ্টেম্বর-অক্টোবর) প্রথম শিম তোলা যায়।",
      actionableTip: "সেপ্টেম্বর-অক্টোবরে যখন বাজারে আর কোনো শিম থাকে না, তখন প্রথম শিম প্রতি কেজি ১৪০-১৮০ টাকায় বিক্রি হয়।"
    },
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "main",
      seasonLabel: "নিয়মিত শীতকালীন শিম",
      growthMonths: 3.5,
      growthDaysText: "১০০ – ১১০ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "ভাদ্র-আশ্বিনে রোপণ করলে পৌষ থেকে ফাল্গুন পর্যন্ত দীর্ঘ সময় শিম সংগ্রহ করা যায়।",
      actionableTip: "মাচায় সুন্দর বাতাস ও রোদ চলাচল নিশ্চিত করলে ফলন ৩০% বৃদ্ধি পায়।"
    }
  ],
  cucumber: [
    {
      startMonth: 1,
      endMonth: 2,
      seasonType: "early",
      seasonLabel: "রমজান ও গ্রীষ্মের প্রস্তুতি",
      growthMonths: 1.5,
      growthDaysText: "৪৫ – ৫০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (রমজান ও চড়া গরম)",
      strategyDescription: "মাঘের শুরুতে পলি টানেল বা শেডে চারা তৈরি করে রোপণ করলে চৈত্র-বৈশাখ মাসে (রমজানের সময়ে) প্রচুর শসা পাওয়া যায়।",
      actionableTip: "রমজানে সালাদের অতিরিক্ত চাহিদায় শসার কেজি ৭০-১০০ টাকায় পৌঁছায়। ৫০ দিনে ফলন ওঠায় দ্রুত মূলধন ফেরত আসে।"
    },
    {
      startMonth: 3,
      endMonth: 4,
      seasonType: "summer",
      seasonLabel: "গ্রীষ্মকালীন শসা",
      growthMonths: 1.5,
      growthDaysText: "৪৫ – ৫৫ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "চৈত্র-বৈশাখ মাসে মাচায় আবাদ করলে জ্যৈষ্ঠ-আষাঢ়ের তীব্র গরমে বিক্রি করে ভালো দাম পাওয়া যায়।",
      actionableTip: "নিয়মিত সেচ দিন; মাটিতে রসের ঘাটতি হলে শসা তিতা হয়ে বাজারমূল্য কমে যায়।"
    }
  ],
  "onion-local": [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম কন্দ (মুড়িকাটা পেঁয়াজ)",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৮০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (বছরের সবচেয়ে বেশি দাম)",
      strategyDescription: "ভাদ্র-আশ্বিনে ছোট কন্দ (Setts) রোপণ করলে কার্তিক-অগ্রহায়ণে (নভেম্বর) নতুন পাতা-পেঁয়াজ ও কন্দ তোলা যায়।",
      actionableTip: "নভেম্বর-ডিসেম্বরে দেশে পুরোনো পেঁয়াজের চূড়ান্ত সংকট থাকে, তখন নতুন মুড়িকাটা পেঁয়াজ কেজিপ্রতি ১০০-১৩০ টাকায় বিক্রি হয়।"
    },
    {
      startMonth: 11,
      endMonth: 12,
      seasonType: "main",
      seasonLabel: "প্রধান হালি পেঁয়াজ (চারা পদ্ধতি)",
      growthMonths: 3.5,
      growthDaysText: "১০০ – ১১০ দিন",
      profitLevel: "moderate",
      profitBadge: "সংরক্ষণ সাপেক্ষে লাভ",
      strategyDescription: "অগ্রহায়ণ-পৌষে চারা লাগালে চৈত্র মাসে (মার্চ-এপ্রিল) পূর্ণাঙ্গ পেঁয়াজ ঘরে ওঠে যখন দর কমে ৪০-৫০ টাকা হয়।",
      actionableTip: "তোলার পর ভালো করে শুকিয়ে (কিউরিং করে) মাচায় ফ্যানের বাতাসে রাখলে সেপ্টেম্বর-নভেম্বরে কেজিপ্রতি ১০০-১২০ টাকায় বিক্রি করা যায়।"
    }
  ],
  "coriander-leaf": [
    {
      startMonth: 6,
      endMonth: 7,
      seasonType: "summer",
      seasonLabel: "বর্ষাকালীন ধনেপাতা",
      growthMonths: 1,
      growthDaysText: "৩০ – ৩৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আকাশচুম্বী দর)",
      strategyDescription: "আষাঢ়-শ্রাবণে উঁচু শেড বা বৃষ্টির পানি প্রতিরোধক পলিথিন ঘরের নিচে ধনেপাতা বপন করুন।",
      actionableTip: "বর্ষাকালে ধনেপাতার কেজি ৩০০-৫০০ টাকা পর্যন্ত পৌঁছায়! মাত্র ৩৫ দিনে জমির শতক প্রতি ১০,০০০-১৫,০০০ টাকা আয় সম্ভব।"
    },
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "শীতকালীন নিয়মিত",
      growthMonths: 1.2,
      growthDaysText: "৩৫ – ৪০ দিন",
      profitLevel: "moderate",
      profitBadge: "সহজ ফলন",
      strategyDescription: "কার্তিক মাসে সহজে খোলা জমিতে ভালো পাতা পাওয়া যায়। দাম থাকে ৩০-৫০ টাকা/কেজি।",
      actionableTip: "সাথী ফসল হিসেবে বাঁধাকপি বা বেগুনের লাইনের মাঝে লাগালে কোনো অতিরিক্ত জমি লাগে না।"
    }
  ],
  "bitter-gourd": [
    {
      startMonth: 12,
      endMonth: 1,
      seasonType: "early",
      seasonLabel: "আগাম গ্রীষ্মকালীন করলা",
      growthMonths: 2,
      growthDaysText: "৬০ – ৬৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (বসন্ত ও গ্রীষ্মের শুরু)",
      strategyDescription: "পৌষের শেষে পলি প্যাকে চারা তৈরি করে মাঘের শুরুতে লাগালে ফাল্গুন-চৈত্র (মার্চ) মাসে প্রথম করলা ওঠে।",
      actionableTip: "বসন্তের শুরুতে বাজারে করলার কেজি ৮০-১০০ টাকায় বিক্রি হয়। মাচায় চাষ করলে ফলন ও মান দ্বিগুণ হয়।"
    },
    {
      startMonth: 2,
      endMonth: 3,
      seasonType: "main",
      seasonLabel: "প্রধান গ্রীষ্মকালীন",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৭৫ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "ফাল্গুন-চৈত্রে রোপণ করলে বৈশাখ-আষাঢ় মাস জুড়ে প্রচুর করলা পাওয়া যায়।",
      actionableTip: "ফেরোমোন ফাঁদ ব্যবহার করে ফল ছিদ্রকারী মাছি পোকা দমন করুন।"
    }
  ],
  "bottle-gourd": [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম শীতকালীন লাউ",
      growthMonths: 2.5,
      growthDaysText: "৭০ – ৮০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আগাম বাজার)",
      strategyDescription: "ভাদ্র মাসে উঁচু মাচায় লাউয়ের বীজ বা চারা বসালে কার্তিক-অগ্রহায়ণে কচি লাউ বিক্রি করা যায়।",
      actionableTip: "শীতের শুরুতে প্রতিটি কচি লাউ ৬০-৮০ টাকায় বিক্রি হয়, যেখানে ভরা শীতে দাম নামে ২৫-৩০ টাকায়।"
    },
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "শীতকালীন প্রধান",
      growthMonths: 2.5,
      growthDaysText: "৭৫ – ৮৫ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক লাভ",
      strategyDescription: "কার্তিক-অগ্রহায়ণের লাউ মাঘ-ফাল্গুনে প্রচুর ধরে। পাতা ও ডগা শাক হিসেবেও বিক্রি করা যায়।",
      actionableTip: "স্ত্রী ফুলে সকালে হাত দিয়ে কৃত্রিম পরাগায়ন (হ্যান্ড পলিনেশন) করলে একটি ফুলও ঝরে না।"
    }
  ],
  radish: [
    {
      startMonth: 8,
      endMonth: 8,
      seasonType: "early",
      seasonLabel: "অতি আগাম মুলা (দ্রুততম লাভ)",
      growthMonths: 1.2,
      growthDaysText: "৪০ – ৪৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (স্বল্পমেয়াদি)",
      strategyDescription: "শ্রাবণ-ভাদ্র মাসে উঁচু পানি নিষ্কাশনযুক্ত জমিতে দ্রুত বর্ধনশীল মুলা লাগালে আশ্বিনেই বাজারে ওঠে।",
      actionableTip: "আশ্বিন মাসে শাকসহ কচি মুলার কেজি ৫০-৭০ টাকায় বিক্রি হয়, অথচ ডিসেম্বরে তা নামে ১০-১৫ টাকায়।"
    },
    {
      startMonth: 9,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "শীতকালীন মৌসুম",
      growthMonths: 1.5,
      growthDaysText: "৪৫ – ৫৫ দিন",
      profitLevel: "moderate",
      profitBadge: "সহজ ও কম খরচ",
      strategyDescription: "আশ্বিন থেকে কার্তিক মাসে নিয়মিত চাষ করলে প্রচুর বড় মুলা পাওয়া যায়।",
      actionableTip: "মুলা শক্ত বা ফাঁপা হওয়ার আগেই নরম অবস্থায় বাজারজাত করুন।"
    }
  ],
  "garlic-local": [
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "জিরো টিলেজ ও নিয়মিত রবি",
      growthMonths: 4,
      growthDaysText: "১১০ – ১২০ দিন",
      profitLevel: "ultra",
      profitBadge: "সংরক্ষণ করে দ্বিগুণ মুনাফা",
      strategyDescription: "কার্তিক মাসে ধান কাটার পরপরই মাটিতে জো থাকা অবস্থায় বিনা চাষে রসুন গুঁজে খড় দিয়ে ঢেকে দিন।",
      actionableTip: "মার্চে তোলার পর না বেচে ঘরে বিনুনি করে বাতাসে ঝুলিয়ে রাখুন; সেপ্টেম্বর-নভেম্বরে দাম কেজিপ্রতি ২০০-২৫০ টাকায় বিক্রি করে ১০০% বেশি লাভ করুন।"
    }
  ],
  "sweet-potato": [
    {
      startMonth: 9,
      endMonth: 10,
      seasonType: "early",
      seasonLabel: "আগাম মিষ্টি আলু",
      growthMonths: 3.5,
      growthDaysText: "১০০ – ১১০ দিন",
      profitLevel: "high",
      profitBadge: "ভালো মুনাফা",
      strategyDescription: "ভাদ্র-আশ্বিনে লতার চারা লাগালে পৌষের শুরুতে নতুন মিষ্টি আলু বাজারে আসে।",
      actionableTip: "কমলা রঙের জাত (ভিটামিন এ সমৃদ্ধ) চাষ করলে শহরের বাজারে প্রিমিয়াম দামে বিক্রি করা যায়।"
    }
  ],
  pumpkin: [
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "রবি মিষ্টি কুমড়া",
      growthMonths: 3.5,
      growthDaysText: "১০০ – ১২০ দিন",
      profitLevel: "high",
      profitBadge: "দীর্ঘমেয়াদি সংরক্ষণযোগ্য",
      strategyDescription: "কার্তিক-অগ্রহায়ণে রোপণ করলে ফাল্গুন-চৈত্রে মিষ্টি কুমড়া ঘরে ওঠে।",
      actionableTip: "পাকা মিষ্টি কুমড়া ঘরে সাধারণ তাপমাত্রায় ৪-৫ মাস নষ্ট হয় না। বর্ষাকালে যখন বাজারে শাকসবজি কমে যায় তখন চড়া দামে বিক্রি করা যায়।"
    }
  ],
  okra: [
    {
      startMonth: 2,
      endMonth: 3,
      seasonType: "early",
      seasonLabel: "আগাম গ্রীষ্মকালীন ঢেঁড়স",
      growthMonths: 1.5,
      growthDaysText: "৪৫ – ৫০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (গ্রীষ্মের শুরু)",
      strategyDescription: "মাঘের শেষে বীজ বপন করলে চৈত্র মাসেই কচি ঢেঁড়স বাজারে নিয়ে আসা যায়।",
      actionableTip: "চৈত্র-বৈশাখ মাসে প্রথম ঢেঁড়সের কেজি ৭০-৯০ টাকায় বিক্রি হয়, যা আষাঢ়ের তুলনায় ৩ গুণ বেশি।"
    },
    {
      startMonth: 4,
      endMonth: 5,
      seasonType: "main",
      seasonLabel: "বর্ষাকালীন ঢেঁড়স",
      growthMonths: 1.8,
      growthDaysText: "৫০ – ৬০ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক লাভ",
      strategyDescription: "বৈশাখ-জ্যৈষ্ঠে রোপণ করলে বর্ষায় টানা কয়েক মাস ফলন পাওয়া যায়।",
      actionableTip: "হলুদ মোজাইক ভাইরাস প্রতিরোধী জাত নির্বাচন করুন।"
    }
  ],
  lalshak: [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম শীতকালীন লালশাক",
      growthMonths: 1,
      growthDaysText: "২৫ – ৩০ দিন",
      profitLevel: "ultra",
      profitBadge: "দ্রুততম লাভ (মাত্র ১ মাসে)",
      strategyDescription: "ভাদ্রের শেষে উঁচু বেডে লালশাক বুনলে আশ্বিন মাসেই বাজারজাত করা যায়।",
      actionableTip: "মাত্র ২৫-৩০ দিনে জমি খালি হয়ে যায় এবং শুরুতে কেজিপ্রতি ৫০-৭০ টাকা দর পাওয়া যায়।"
    },
    {
      startMonth: 10,
      endMonth: 12,
      seasonType: "main",
      seasonLabel: "শীতকালীন লালশাক",
      growthMonths: 1,
      growthDaysText: "৩০ – ৩৫ দিন",
      profitLevel: "moderate",
      profitBadge: "স্বাভাবিক লাভ",
      strategyDescription: "কার্তিক-অগ্রহায়ণে অল্প খরচে চমৎকার লালশাক উৎপাদন করা যায়।",
      actionableTip: "এক জমিতে বারবার বপন করে মাসে মাসে লাভ তোলা যায়।"
    }
  ],
  palongshak: [
    {
      startMonth: 8,
      endMonth: 9,
      seasonType: "early",
      seasonLabel: "আগাম পালংশাক",
      growthMonths: 1.2,
      growthDaysText: "৩৫ – ৪০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (আগাম শীত)",
      strategyDescription: "ভাদ্রের শেষে চারা বা বীজ ফেললে কার্তিকের শুরুতে বাজারে কচি পালংশাক তোলা যায়।",
      actionableTip: "কার্তিক মাসে প্রথম পালংশাকের কেজি ৬০-৮০ টাকায় বিক্রি হয়, যেখানে ডিসেম্বরে দাম নামে ২০ টাকায়।"
    }
  ],
  "yardlong-bean": [
    {
      startMonth: 2,
      endMonth: 3,
      seasonType: "early",
      seasonLabel: "আগাম বরবটি",
      growthMonths: 2,
      growthDaysText: "৫০ – ৬০ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (গ্রীষ্মের শুরু)",
      strategyDescription: "ফাল্গুনের শুরুতে মাচায় বরবটি লাগালে বৈশাখের শুরুতে ফলন আসে।",
      actionableTip: "বৈশাখ মাসে কচি বরবটির কেজি ৭০-৯০ টাকায় বিক্রি হয়।"
    }
  ],
  peas: [
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "early",
      seasonLabel: "আগাম মটরশুঁটি",
      growthMonths: 2,
      growthDaysText: "৬০ – ৬৫ দিন",
      profitLevel: "ultra",
      profitBadge: "সর্বোচ্চ লাভ (ডিসেম্বরের নতুন মটরশুঁটি)",
      strategyDescription: "কার্তিকের ১ম সপ্তাহে লাগালে পৌষের শুরুতে নতুন কচি মটরশুঁটি বাজারে তোলা যায়।",
      actionableTip: "ডিসেম্বরের শুরুতে মটরশুঁটির কেজি ১৫০-২০০ টাকা পর্যন্ত ওঠে, যা জানুয়ারিতে নেমে ৬০-৭০ টাকায় আসে।"
    }
  ]
};

// Default fallback rule for other crops
export function getDefaultProfitRules(crop: Crop): PlantingWindowRule[] {
  return [
    {
      startMonth: 10,
      endMonth: 11,
      seasonType: "main",
      seasonLabel: "রবি ও শীতকালীন মৌসুম",
      growthMonths: 3,
      growthDaysText: "৮০ – ৯০ দিন",
      profitLevel: "high",
      profitBadge: "মৌসুমভিত্তিক লাভ",
      strategyDescription: `কার্তিক-অগ্রহায়ণে ${crop.bn} রোপণ করলে মাঘ-ফাল্গুনে ফসল তোলা যায়।`,
      actionableTip: "আগাম চারা তৈরি করে বাজারে অন্য কৃষকের আগে ফসল তুলতে পারলে ৩০-৫০% বেশি দাম নিশ্চিত হয়।"
    }
  ];
}

export interface MonthlyCropOpportunity {
  crop: Crop;
  rule: PlantingWindowRule;
  plantingMonth: number;
  plantingMonthName: string;
  harvestMonth: number;
  harvestMonthName: string;
  expectedPrice: number | null;
  regularPrice: number | null;
  profitScore: number; // 1-100 rating
}

export function getCropProfitOpportunitiesForMonth(
  month: number, // 1-12
  cropAverages?: Map<string, { seasonal: (number | null)[]; seasonalPrices: (number | null)[] }>
): MonthlyCropOpportunity[] {
  const results: MonthlyCropOpportunity[] = [];

  for (const crop of CROPS) {
    const rules = CROP_PROFIT_RULES[crop.id] || getDefaultProfitRules(crop);

    for (const rule of rules) {
      // Check if `month` falls between startMonth and endMonth (handling wraparound if any)
      const matches =
        rule.startMonth <= rule.endMonth
          ? month >= rule.startMonth && month <= rule.endMonth
          : month >= rule.startMonth || month <= rule.endMonth;

      if (!matches) continue;

      const harvestMonth = ((month - 1 + Math.ceil(rule.growthMonths)) % 12) + 1;

      // Seasonal price lookup
      let expectedPrice: number | null = null;
      let regularPrice: number | null = null;
      let seasonalIndex: number | null = null;

      if (cropAverages && cropAverages.has(crop.id)) {
        const stats = cropAverages.get(crop.id)!;
        expectedPrice = stats.seasonalPrices[harvestMonth - 1] ?? null;
        seasonalIndex = stats.seasonal[harvestMonth - 1] ?? null;
        
        // Find minimum or average price for comparison
        const validPrices = stats.seasonalPrices.filter((p): p is number => p !== null && p > 0);
        if (validPrices.length > 0) {
          regularPrice = Math.min(...validPrices);
        }
      }

      // Calculate score based on profit level and seasonal index
      let baseScore = rule.profitLevel === "ultra" ? 95 : rule.profitLevel === "high" ? 80 : 65;
      if (seasonalIndex && seasonalIndex > 100) {
        baseScore += Math.min(15, Math.round((seasonalIndex - 100) / 3));
      }

      results.push({
        crop,
        rule,
        plantingMonth: month,
        plantingMonthName: monthName(month),
        harvestMonth,
        harvestMonthName: monthName(harvestMonth),
        expectedPrice: expectedPrice ? Math.round(expectedPrice) : null,
        regularPrice: regularPrice ? Math.round(regularPrice) : null,
        profitScore: Math.min(100, baseScore)
      });
    }
  }

  // Sort by profit score descending
  results.sort((a, b) => b.profitScore - a.profitScore);
  return results;
}

export interface CropFullStrategy {
  crop: Crop;
  rules: PlantingWindowRule[];
  bestPlantingMonth: number;
  bestPlantingName: string;
  bestHarvestMonth: number;
  bestHarvestName: string;
  highestProfitRule: PlantingWindowRule;
  all12Months: {
    month: number;
    monthName: string;
    canPlant: boolean;
    isBest: boolean;
    rule?: PlantingWindowRule;
    harvestMonth?: number;
    harvestMonthName?: string;
  }[];
}

export function getCropFullStrategy(cropId: string): CropFullStrategy | null {
  const crop = CROP_BY_ID.get(cropId);
  if (!crop) return null;

  const rules = CROP_PROFIT_RULES[crop.id] || getDefaultProfitRules(crop);
  // Find highest profit rule
  const bestRule = rules.find((r) => r.profitLevel === "ultra") || rules[0];

  const bestPlantingMonth = bestRule.startMonth;
  const bestHarvestMonth = ((bestPlantingMonth - 1 + Math.ceil(bestRule.growthMonths)) % 12) + 1;

  const all12Months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const rule = rules.find((r) =>
      r.startMonth <= r.endMonth
        ? m >= r.startMonth && m <= r.endMonth
        : m >= r.startMonth || m <= r.endMonth
    );
    const canPlant = Boolean(rule);
    const isBest = m === bestPlantingMonth;
    const harvestMonth = rule ? ((m - 1 + Math.ceil(rule.growthMonths)) % 12) + 1 : undefined;

    return {
      month: m,
      monthName: monthName(m),
      canPlant,
      isBest,
      rule,
      harvestMonth,
      harvestMonthName: harvestMonth ? monthName(harvestMonth) : undefined
    };
  });

  return {
    crop,
    rules,
    bestPlantingMonth,
    bestPlantingName: monthName(bestPlantingMonth),
    bestHarvestMonth,
    bestHarvestName: monthName(bestHarvestMonth),
    highestProfitRule: bestRule,
    all12Months
  };
}
