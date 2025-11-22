
import { QuestConfig } from '../types';

const QUESTS: QuestConfig[] = [];

// Helper to add a quest
const addQuest = (q: QuestConfig) => QUESTS.push(q);

// --- LEVEL 1-10: THE BASICS ---

addQuest({
    id: 'quest_lv1',
    level: 1,
    npcId: 'v1_guide', // City Guard
    title: 'Welcome to the Village',
    description: 'The City Guard wants to test your skills. Defeat 5 Wild Dogs to prove you are ready to become an adventurer.',
    dialogStart: "Halt, soldier! You look green behind the ears. Before I let you wander too far, show me you can handle a weapon. Go slay 5 Wild Dogs outside the gates.",
    dialogProgress: "You haven't finished yet? The dogs are just outside the gate!",
    dialogComplete: "Not bad. You might survive after all. Here is some gold for your trouble.",
    targetEnemyId: 'wild_dog',
    requiredCount: 5,
    reward: { exp: 50, yang: 200, itemTemplateId: 'potion_red', itemCount: 20 }
});

addQuest({
    id: 'quest_lv2',
    level: 2,
    npcId: 'v1_general', // General
    title: 'The Alpha Threat',
    description: 'The wolves are getting aggressive. Hunt down 5 Wolves to thin their numbers.',
    dialogStart: "The wolves have been attacking our supply caravans. We need to thin the pack. Go kill 5 Wolves.",
    dialogProgress: "More wolves remain. Keep fighting.",
    dialogComplete: "Good work. The roads are safer now.",
    targetEnemyId: 'wolf',
    requiredCount: 5,
    reward: { exp: 100, yang: 500, itemTemplateId: 'potion_blue', itemCount: 10 }
});

addQuest({
    id: 'quest_lv3',
    level: 3,
    npcId: 'v1_guide',
    title: 'Alpha Wolf Hunt',
    description: 'An Alpha Wolf has been spotted. It leads the pack. Kill 2 of them.',
    dialogStart: "A large blue wolf is leading the pack. It's an Alpha Wolf. If you kill the leader, the pack will scatter.",
    dialogProgress: "The Alpha Wolf is dangerous, be careful.",
    dialogComplete: "You defeated the Alpha? Impressive.",
    targetEnemyId: 'alpha_wolf',
    requiredCount: 2,
    reward: { exp: 250, yang: 1000, itemTemplateId: 'sword_1', itemCount: 1 }
});

addQuest({
    id: 'quest_lv4',
    level: 4,
    npcId: 'v1_blacksmith',
    title: 'Material Gathering',
    description: 'The Blacksmith needs materials. Hunt 5 Wild Boars.',
    dialogStart: "I need sturdy leather for new armor. The Wild Boars have tough hides. Bring me some.",
    dialogProgress: "I'm still waiting for those boar hides.",
    dialogComplete: "This is good quality leather. I can work with this.",
    targetEnemyId: 'wild_boar',
    requiredCount: 5,
    reward: { exp: 400, yang: 1500, itemTemplateId: 'wolf_fur', itemCount: 2 }
});

addQuest({
    id: 'quest_lv5',
    level: 5,
    npcId: 'v1_general',
    title: 'Bear Necessity',
    description: 'Bears are encroaching on the village. Kill 5 Bears.',
    dialogStart: "The bears are waking up and they are hungry. Drive them back before they enter the village.",
    dialogProgress: "The bears are tough, aim for the heart.",
    dialogComplete: "Excellent. The village is safe for now.",
    targetEnemyId: 'bear',
    requiredCount: 5,
    reward: { exp: 600, yang: 2000, itemTemplateId: 'potion_red_m', itemCount: 10 }
});

addQuest({
    id: 'quest_lv6',
    level: 6,
    npcId: 'v1_old_man',
    title: 'Tiger Trouble',
    description: 'The Old Man saw a Tiger near the river. Investigate and kill 3 Tigers.',
    dialogStart: "My eyes aren't what they used to be, but I swear I saw a massive Tiger by the bridge. Please, investigate.",
    dialogProgress: "Did you find the tiger?",
    dialogComplete: "A Tiger? Heavens, I'm glad you were there.",
    targetEnemyId: 'tiger',
    requiredCount: 3,
    reward: { exp: 800, yang: 2500, itemTemplateId: 'copper_bell', itemCount: 1 }
});

addQuest({
    id: 'quest_lv7',
    level: 7,
    npcId: 'v1_blacksmith',
    title: 'Stronger Steel',
    description: 'To refine better weapons, kill 10 Wolves.',
    dialogStart: "My furnace burns cold. I need spirit energy from the wolves to stoke the flames. Kill 10 of them.",
    dialogProgress: "The fire needs more energy!",
    dialogComplete: "Ah, the fire roars! Now I can upgrade weapons.",
    targetEnemyId: 'wolf',
    requiredCount: 10,
    reward: { exp: 1000, yang: 3000, itemTemplateId: 'glaive_1', itemCount: 1 }
});

addQuest({
    id: 'quest_lv8',
    level: 8,
    npcId: 'v1_guide',
    title: 'Boar Population',
    description: 'Wild Boars are destroying crops. Kill 10 Wild Boars.',
    dialogStart: "The farmers are complaining. The boars are eating all the crops. Deal with them.",
    dialogProgress: "Save the crops!",
    dialogComplete: "The farmers send their thanks.",
    targetEnemyId: 'wild_boar',
    requiredCount: 10,
    reward: { exp: 1200, yang: 3500, itemTemplateId: 'dagger_1', itemCount: 1 }
});

addQuest({
    id: 'quest_lv9',
    level: 9,
    npcId: 'v1_general',
    title: 'Bear Hunt II',
    description: 'The Bears have returned. Kill 8 Bears.',
    dialogStart: "They are back. And angry. We need a stronger force. Go.",
    dialogProgress: "Don't let them maul you.",
    dialogComplete: "You are becoming a fine warrior.",
    targetEnemyId: 'bear',
    requiredCount: 8,
    reward: { exp: 1500, yang: 4000, itemTemplateId: 'leather_armor', itemCount: 1 }
});

addQuest({
    id: 'quest_lv10',
    level: 10,
    npcId: 'v1_general',
    title: 'The Metin Stone',
    description: 'Destroy a Metin of Sorrow. These stones are corrupting the land.',
    dialogStart: "Soldier! The sky has turned dark. A Metin Stone has fallen. It corrupts animals and drives them mad. You must destroy it!",
    dialogProgress: "The stone must be destroyed at all costs.",
    dialogComplete: "You destroyed the Metin? Incredible power! You are a hero in the making.",
    targetEnemyId: 'metin_stone',
    requiredCount: 1,
    reward: { exp: 5000, yang: 10000, itemTemplateId: 'book_aura', itemCount: 1 }
});

// --- PROCEDURAL GENERATION FOR LEVELS 11-99 ---

const MOB_TYPES = ['wild_dog', 'wolf', 'alpha_wolf', 'wild_boar', 'bear', 'tiger', 'metin_stone'];

for (let lvl = 11; lvl <= 99; lvl++) {
    // Cycle through mob types to ensure variety
    const mobIndex = (lvl - 1) % MOB_TYPES.length;
    const mobId = MOB_TYPES[mobIndex];
    const count = 5 + Math.floor(lvl / 2); // Scales with level
    
    // NPC rotation
    const npcs = ['v1_general', 'v1_guide', 'v1_blacksmith', 'v1_old_man'];
    const npcId = npcs[lvl % npcs.length];

    // Reward scaling
    const exp = lvl * 500;
    const yang = lvl * 1000;
    let item = undefined;
    
    if (lvl % 10 === 0) {
        item = 'potion_red_m'; // Every 10 levels get potions
    }
    if (lvl === 30) item = 'full_moon_sword';
    if (lvl === 45) item = 'rib_knife';
    if (lvl === 65) item = 'nymph_sword';

    addQuest({
        id: `quest_lv${lvl}`,
        level: lvl,
        npcId: npcId,
        title: `Level ${lvl} Mission`,
        description: `Prove your strength by defeating ${count} ${mobId.replace('_', ' ')}s.`,
        dialogStart: `Greetings. As you grow stronger, the challenges grow greater. I need you to hunt ${count} ${mobId.replace('_', ' ')}s.`,
        dialogProgress: `The hunt is not over.`,
        dialogComplete: `Well done. Here is your reward.`,
        targetEnemyId: mobId,
        requiredCount: count,
        reward: {
            exp,
            yang,
            itemTemplateId: item,
            itemCount: 1
        }
    });
}

export const getQuestForLevel = (level: number): QuestConfig | undefined => {
    return QUESTS.find(q => q.level === level);
};

export const getQuestById = (id: string): QuestConfig | undefined => {
    return QUESTS.find(q => q.id === id);
};
