
// Add import for Tale type
import { Tale } from './types.ts';

import fantasy from './uploads/primer/fantasy.png';
import pencil from './uploads/primer/pencil.png';
import pixar from './uploads/primer/pixar.png';
import watercolor from './uploads/primer/watercolor.png';

import castle from './uploads/primer/castle.png';
import dino from './uploads/primer/dino.png';
import forest from './uploads/primer/forest.png';
import ocean from './uploads/primer/ocean.png';
import pirates from './uploads/primer/pirates.png';
import robots from './uploads/primer/robots.png';
import space from './uploads/primer/space.png';
import sweets from './uploads/primer/sweets.png';
import winter from './uploads/primer/winter.png';

export const BRAND_NAME = "Мой сказ";

export const TELEGRAM_BOT_URL = "https://t.me/skaz_ai_bot";

export const PRICING = {
  EXPLORER: {
    MONTHLY: 499,
    YEARLY: 399,
  },
  STORYTELLER: {
    MONTHLY: 990,
    YEARLY: 790,
  },
  PRINT_BOOK: 1490
};

export const THEMES = [
  { 
    id: 'winter', 
    label: 'Зима', 
    icon: 'winter', 
    description: 'Ледяные дворцы и северное сияние.',
    image: winter
  },
  { 
    id: 'forest', 
    label: 'Лес', 
    icon: 'forest', 
    description: 'Таинственные существа и магия природы.',
    image: forest
  },
  { 
    id: 'ocean', 
    label: 'Океан', 
    icon: 'ocean', 
    description: 'Подводные города и сокровища.',
    image: ocean
  },
  { 
    id: 'castle', 
    label: 'Замок', 
    icon: 'castle', 
    description: 'Рыцари, драконы и благородные сердца.',
    image: castle
  },
  { 
    id: 'dino', 
    label: 'Дино', 
    icon: 'dino', 
    description: 'Мир древних гигантов и джунглей.',
    image: dino
  },
  { 
    id: 'robots', 
    label: 'Роботы', 
    icon: 'robots', 
    description: 'Город будущего и умные машины.',
    image: robots
  },
  { 
    id: 'sweets', 
    label: 'Сласти', 
    icon: 'sweets', 
    description: 'Карамельные реки и пряничные домики.',
    image: sweets
  },
  { 
    id: 'pirates', 
    label: 'Пираты', 
    icon: 'pirates', 
    description: 'Поиск сокровищ и морские приключения.',
    image: pirates
  },
  { 
    id: 'space', 
    label: 'Космос', 
    icon: 'space', 
    description: 'Звездные пути и добрые пришельцы.',
    image: space
  }
];

export const STYLES = [
  { 
    id: 'pixar', 
    label: '3D Анимация', 
    description: 'Стиль современных мультфильмов.',
    image: pixar
  },
  { 
    id: 'watercolor', 
    label: 'Акварель', 
    description: 'Художественная ручная работа.',
    image: watercolor
  },
  { 
    id: 'sketch', 
    label: 'Набросок', 
    description: 'Классическая книжная графика.',
    image: pencil
  },
  { 
    id: 'fantasy', 
    label: 'Фэнтези', 
    description: 'Детализированный эпический арт.',
    image: fantasy
  }
];

export const CHARACTER_TEMPLATES = [
  { id: 'mom', label: 'Мама', role: 'Мама', icon: '👩', desc: 'Добрая и мудрая помощница.' },
  { id: 'dad', label: 'Папа', role: 'Папа', icon: '👨', desc: 'Сильный и смелый защитник.' },
  { id: 'cat', label: 'Кот', role: 'Питомец', icon: '🐱', desc: 'Пушистый и хитрый друг.' },
  { id: 'dog', label: 'Пес', role: 'Питомец', icon: '🐶', desc: 'Верный и веселый спутник.' },
  { id: 'friend', label: 'Друг', role: 'Лучший друг', icon: '🧒', desc: 'Напарник по приключениям.' }
];

export const STORY_IDEAS = [
  { title: "Потерянная звезда", text: "Маленькая звездочка упала в наш сад, и нам нужно помочь ей вернуться на небо, построив волшебный корабль." },
  { title: "Тайный язык животных", text: "Герой находит старинный амулет, который позволяет понимать, о чем шепчутся лесные звери и домашние питомцы." },
  { title: "Фабрика снов", text: "Путешествие на облачную фабрику, где создаются самые добрые сны, чтобы спасти мир от скуки." },
  { title: "Подводный карнавал", text: "Приглашение на грандиощный праздник в коралловом дворце, где рыбы умеют танцевать вальс." },
  { title: "Робот с добрым сердцем", text: "История о железном друге, который хотел научиться смеяться и дарить цветы." },
  { title: "Школа маленьких магов", text: "Первый день в академии, где вместо учебников — волшебные палочки, а вместо обеда — облака." },
  { title: "Хранитель времени", text: "Старинные часы в дедушкином доме оказываются порталом в разные эпохи, где нужно вернуть утерянные секунды радости." },
  { title: "Летающий остров", text: "В небе появился остров, пахнущий корицей. Герой отправляется туда на воздушном шаре, чтобы узнать тайну парящих гор." },
  { title: "Цирк невидимок", text: "В город приехал самый удивительный цирк, где артисты — это добрые духи, показывающие чудеса света и тени." },
  { title: "Дерево желаний", text: "В центре города расцвело дерево, плоды которого превращаются в исполнение самых искренних и добрых желаний." },
  { title: "Лунный заяц", text: "Лунный заяц приглашает героя в гости, чтобы показать, как по ночам зажигаются фонарики на звездном небе." },
  { title: "Дракон-кулинар", text: "Огромный дракон вместо огня выдыхает ароматный пар и мечтает испечь самый большой торт в мире для всех детей." },
  { title: "Детектив в мире игрушек", text: "Ночью игрушки оживают, и кто-то спрятал любимый мячик. Герой становится детективом, чтобы распутать это веселое дело." },
  { title: "Путешествие Капельки", text: "История о маленькой капле дождя, которая мечтала увидеть океан и завела друзей среди лесных ручейков." },
  { title: "Город на пуговицах", text: "Приключение в крошечном мире, где все дома сделаны из пуговиц, а улицы вымощены цветными нитками." }
];

export const APP_MODES = {
  MINI_APP: 'mini-app',
  WEB: 'web'
};