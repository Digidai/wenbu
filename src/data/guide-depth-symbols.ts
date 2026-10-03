import type { GuideExpansion } from './guide-types';

const source = (title: string, url: string, noteZh: string, noteEn: string) => ({
  title,
  url,
  noteZh,
  noteEn,
});
const product = (path: string, noteZh: string, noteEn: string) =>
  source(`Wenbu · ${path}`, `https://github.com/wenbu-app/wenbu/blob/main/${path}`, noteZh, noteEn);
const waite = source(
  'A. E. Waite · The Pictorial Key to the Tarot, Part III',
  'https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_3',
  '用于核对韦特的牌名及正逆位条目；本文的练习问题为问卜原创，不是原著译文。',
  'Primary text for Waite’s card entries and reversal conventions. The exercises here are original Wenbu prompts, not translations.',
);

export const symbolsDepth: Record<string, GuideExpansion> = {
  'iching-three-coins': {
    zh: {
      answer:
        '三钱法把每次三枚硬币的总数记为一爻，连续六次，由下向上组成一卦。6、8 先画阴爻，7、9 先画阳爻；只有 6 和 9 变化。先保存六个原始数值，再核对本卦、动爻和之卦，才能让后续解释有可检查的依据。',
      takeaways: [
        '数字包含两层信息：阴阳决定当前线形，老少决定是否变化。只抄实线、断线会丢失动爻信息。',
        '第一掷对应最下面的初爻。中文卦名常先说上卦；投掷顺序与卦名的说法不要混用。',
        '三钱法的四种总数并非各占四分之一。问卜模拟三次公平的二选一，再相加，保留 1∶3∶3∶1 的分布。',
      ],
      figure: {
        caption: '一张卦的两种状态：只翻转第 1、4 爻',
        description:
          '示例由下至上为 6、7、8、9、7、8。本卦下坎上兑，为第 47 卦困；初爻阴变阳、第四爻阳变阴，得到下兑上坎的第 60 卦节。两列之间标出变化位置，其余爻保持原样。',
      },
      table: {
        title: '每次投掷之后，怎样画这一爻',
        columns: ['总数', '三枚硬币的组合', '本卦线形', '之卦线形与概率'],
        rows: [
          ['6 · 老阴', '2 + 2 + 2，共 1 种', '断线，标为动爻', '变实线；1/8'],
          ['7 · 少阳', '两个 2、一个 3，共 3 种排列', '实线，不动', '仍为实线；3/8'],
          ['8 · 少阴', '一个 2、两个 3，共 3 种排列', '断线，不动', '仍为断线；3/8'],
          ['9 · 老阳', '3 + 3 + 3，共 1 种', '实线，标为动爻', '变断线；1/8'],
        ],
      },
      example: {
        title: '完整核对：困卦怎样变成节卦',
        intro:
          '这组数据专用于认图，不是替你随机起的一卦。准备一列从下到上编号 1—6 的空格，并把 6、7、8、9、7、8 依次写进去。',
        steps: [
          '画本卦：第 1、3、6 爻为断线，第 2、4、5 爻为实线。保留每条线旁边的原数值，暂时不读提示文字。',
          '拆成两组：第 1—3 爻是坎，第 4—6 爻是兑。按上卦兑、下卦坎查表，得到泽水困，文王卦序 47。',
          '只改动爻：第 1 爻的 6 变为实线，第 4 爻的 9 变为断线。第 2、3、5、6 爻不动，不能把整张卦一起翻转。',
          '再认上下卦：新下卦为兑，新上卦为坎，得到水泽节，文王卦序 60。将原始数列、动爻 1/4、两卦名称一起保存在记录中。',
          '若请 Agent 解读，先要求它复述这四项数据，再说明使用哪种多动爻读法；遇到“原文说”时，继续索要篇章与具体爻位。',
        ],
        conclusion:
          '可以独立复算的是 47 → 60 的结构转换。“困境要用节制解决”只是可能的现代联想，不是这组数字已经证明的现实因果关系。',
      },
      faq: [
        {
          question: '没有动爻，是否应该重新起卦？',
          answer:
            '不需要。每一爻不动的概率为 3/4，六爻都不动约占 17.8%；这在三钱法里很正常。本卦和之卦相同，记录“无动爻”即可，不应为了得到变化而重抽。',
        },
        {
          question: '手机随机结果和真实铜钱，哪一种更准确？',
          answer:
            '问卜的随机起卦和公平硬币遵循同一套数值分布；真实硬币还会受到硬币形状、投掷方式影响。概率模型相同不等于预测效力已被证实。想保留手工过程，可以选录入模式并保存六次结果。',
        },
        {
          question: '想请其他 Agent 复核，应提供哪些信息？',
          answer:
            '至少提供六个数值、bottom-to-top 顺序、三钱法名称、本卦编号与动爻位置。只提供一张无数字的截图，往往无法区分 6 与 8、7 与 9，也就不能恢复之卦。',
        },
      ],
      glossary: [
        { term: '爻', definition: '六爻卦中的一条线；数位从最下方的初爻向上至上爻。' },
        { term: '动爻', definition: '本次三钱法中数值为 6 或 9 的爻；构造之卦时改变阴阳线形。' },
        { term: '之卦', definition: '将本卦所有动爻翻转后得到的卦，也常称变卦；它首先是规则转换的结果。' },
      ],
    },
    en: {
      answer:
        'In the three-coin method, one toss of three coins produces one line. Six tosses build the figure from bottom to top. Totals of 6 and 8 begin as yin; 7 and 9 begin as yang. Only 6 and 9 change. Keep all six numbers so another reader can reconstruct both hexagrams.',
      takeaways: [
        'Each number records both a line’s shape and whether it changes. Copying only solid and broken lines loses part of the cast.',
        'The first toss is the bottom line. A compound name such as Lake over Water names the upper trigram first; that is a different order from the casting record.',
        'The four totals are not equally likely. Wenbu adds three independent fair binary outcomes, preserving the 1:3:3:1 distribution for 6, 7, 8 and 9.',
      ],
      figure: {
        caption: 'Two states of one cast: only lines 1 and 4 change',
        description:
          'Read 6, 7, 8, 9, 7, 8 from bottom to top. The original is Lake over Water, Kun 困, number 47. Flipping the first and fourth lines gives Water over Lake, Jie 节, number 60. The other four lines stay unchanged.',
      },
      table: {
        title: 'From a coin total to a line',
        columns: ['Total', 'Coin combinations', 'Original line', 'Resulting line / probability'],
        rows: [
          ['6 · Old yin', '2 + 2 + 2; one arrangement', 'Broken, changing', 'Becomes solid; 1/8'],
          ['7 · Young yang', 'Two 2s and one 3; three arrangements', 'Solid, stable', 'Stays solid; 3/8'],
          ['8 · Young yin', 'One 2 and two 3s; three arrangements', 'Broken, stable', 'Stays broken; 3/8'],
          ['9 · Old yang', '3 + 3 + 3; one arrangement', 'Solid, changing', 'Becomes broken; 1/8'],
        ],
      },
      example: {
        title: 'Check the whole transformation: 47 to 60',
        intro:
          'This is a teaching example, not a random reading for you. Draw six numbered spaces with line 1 at the bottom. Enter 6, 7, 8, 9, 7, 8 in that order.',
        steps: [
          'Draw broken lines at positions 1, 3 and 6, and solid lines at 2, 4 and 5. Leave the original numbers alongside them before reading any interpretation.',
          'Separate the figure into lower and upper groups. The bottom three form Kan, Water; the top three form Dui, Lake. The lookup is Lake over Water: Kun 困, number 47.',
          'Flip only the changing positions. The 6 at line 1 becomes solid; the 9 at line 4 becomes broken. Do not reverse the entire diagram or alter a stable line.',
          'Identify the new groups: Lake below, Water above. This is Jie 节, number 60. Save the six numbers, changing positions 1 and 4, and both hexagram names together.',
          'Ask an Agent to repeat those details before interpreting them. If it selects one changing line over another, request its reading convention. A claim to quote the classic needs a passage and line reference.',
        ],
        conclusion:
          'The checkable result is the structural change from 47 to 60. Reading it as “meet constraint with moderation” is a possible modern association, not a causal fact established by the numbers.',
      },
      faq: [
        {
          question: 'Should I cast again if no lines change?',
          answer:
            'No. Each line has a 3/4 chance of being stable, so a six-line cast has about a 17.8% chance of having no changes. Record that outcome. The two hexagrams are identical; a second cast is not needed to make the first one valid.',
        },
        {
          question: 'Are digital coins more accurate than physical coins?',
          answer:
            'Wenbu uses the same numerical distribution as three fair coins. Physical outcomes may also depend on the coins and how they are tossed. Matching a probability model does not establish predictive power. Manual entry is useful when you want to keep a physical casting process.',
        },
        {
          question: 'What should I give another Agent for a reproducible check?',
          answer:
            'Provide the six numbers, the bottom-to-top order, the three-coin method, the original number and the changing positions. An unlabeled screenshot cannot distinguish 6 from 8 or 7 from 9, so it may not contain enough information to reconstruct the resulting hexagram.',
        },
      ],
      glossary: [
        { term: 'Yao 爻', definition: 'One line of a hexagram, numbered from the bottom upward.' },
        {
          term: 'Changing line',
          definition:
            'A line valued 6 or 9 in this coin method; it flips when constructing the resulting figure.',
        },
        {
          term: 'Resulting hexagram',
          definition:
            'The figure after every changing line flips, often called the relating hexagram or zhi gua 之卦.',
        },
      ],
    },
    sources: [
      product(
        'src/lib/iching.ts',
        '支撑三钱概率、爻位顺序、动爻转换与随机/手工两种模式；示例由同一算法复算。',
        'Supports the probabilities, bottom-to-top order, changing-line algorithm and random/manual modes; the example is checked against this implementation.',
      ),
      source(
        '《周易》· 困',
        'https://zh.wikisource.org/wiki/周易/困',
        '用于核对第 47 卦的名称与经典卦爻辞；不把本文现代联想说成原文。',
        'Primary text for hexagram 47 and its line texts, separate from the original reflection exercise.',
      ),
      source(
        '《周易》· 节',
        'https://zh.wikisource.org/wiki/周易/節',
        '用于核对之卦节的名称与经典条目，不作为随机算法的出处。',
        'Primary text for Jie, the resulting hexagram; it is not cited as documentation for the software’s random algorithm.',
      ),
    ],
  },
  'iching-trigrams': {
    zh: {
      answer:
        '八卦是三条阴阳线的八种组合；六十四卦由一个下卦和一个上卦叠成。识图时先按从下到上的顺序数线，再分别认出两组三爻。天、地、雷、风、水、火、山、泽是传统卦象的入门索引，不能代替具体卦辞、爻辞与阅读语境。',
      takeaways: [
        '相同两个经卦，交换上下就可能成为不同的重卦。既济与未济是练习这个区别的好例子。',
        '爻位编号始终从下向上；卦名里的“水火”却通常先说上水、后说下火。',
        '先天、后天八卦图是不同的排列方式。初学识别线形不必先背方位，也不要把展示位置当成个人方向建议。',
      ],
      figure: {
        caption: '八种三爻结构：先看线形，再认名称',
        description:
          '八个图形分别是乾、坤、震、巽、坎、离、艮、兑。每个图形的线位由下向上读取；下表中的位码也使用这一顺序，1 表示实线、0 表示断线。图示用于认形，不表示先天或后天方位。',
      },
      table: {
        title: '八卦识图表：位码从下到上',
        columns: ['卦名', '位码', '传统自然意象', '认形提示'],
        rows: [
          ['乾 ☰', '111', '天', '三条实线'],
          ['坤 ☷', '000', '地', '三条断线'],
          ['震 ☳', '100', '雷', '实线在最下方'],
          ['巽 ☴', '011', '风', '断线在最下方'],
          ['坎 ☵', '010', '水', '实线在中间'],
          ['离 ☲', '101', '火', '断线在中间'],
          ['艮 ☶', '001', '山', '实线在最上方'],
          ['兑 ☱', '110', '泽', '断线在最上方'],
        ],
      },
      example: {
        title: '交换上下卦，理解既济与未济',
        intro: '拿两张纸，一张画离，一张画坎。暂时不用动爻：阳爻都记 7，阴爻都记 8，只观察两个三爻组的摆放。',
        steps: [
          '把离放下方、坎放上方。由下至上读得 7、8、7、8、7、8；下离是火，上坎是水，因此称水火既济，卦序 63。',
          '让两组三爻交换位置，各组三条线内部的顺序不变。新数列为 8、7、8、7、8、7：下坎上离，称火水未济，卦序 64。',
          '对照线形确认：这次做的是上下经卦交换，没有产生 6 或 9，也没有通过随机投掷得到动爻。两张图是构图练习中的两个独立样本。',
          '读经典时把三个层次分开：卦名用于识别，卦辞论全卦，爻辞针对某一爻位。请求 Agent 时可指定“解释既济的下卦与上卦，并标明资料出处”，避免直接问“这个卦好不好”。',
        ],
        conclusion:
          '如果只记住“有水也有火”，就漏掉了顺序这个关键信息。保存数列和上下位置，比单独记一个意象词更适合核对，也更方便机器读取。',
      },
      faq: [
        {
          question: '卦序 63、64 是好坏或完成度的分数吗？',
          answer:
            '不是。这是文王卦序中的编号。既济、未济的名称涉及完成与未完成，但编号不是成功概率，也不是用户的进度条；仍需要看该卦具体文本与所问情境。',
        },
        {
          question: '位码 100 为什么是震，不是艮？',
          answer:
            '因为本表第一位代表最下面的一爻，100 是下实、中断、上断。若别的资料从上往下写，字符顺序会反过来。交换资料时务必同时说明“bottom-to-top”，不要只传三位数字。',
        },
        {
          question: '“坎为水”能不能直接解释成会下雨？',
          answer:
            '不能。它是经典象征系统中的对应，不是天气观测。研究某一传统如何把意象用于占问，需要说明具体方法与文本；日常天气仍应查天气资料。认图表本身不提供这些外推规则。',
        },
      ],
      glossary: [
        { term: '经卦', definition: '由三爻构成的基本卦，即八卦之一；英文通常称 trigram。' },
        { term: '重卦', definition: '由上下两个经卦组成的六爻卦，共六十四种；英文通常称 hexagram。' },
        { term: '卦象', definition: '可指卦的线形结构及传统附着的象征意象；引用时应说明指的是哪一层。' },
      ],
    },
    en: {
      answer:
        'A trigram is one of eight possible patterns of three yin or yang lines. Two trigrams, one below the other, form a hexagram. Count upward from the bottom, identify each three-line group, then look up the pair. Traditional images such as Water or Fire help with recognition; they do not replace the text of a particular hexagram.',
      takeaways: [
        'The same two trigrams can form different hexagrams when their positions are exchanged. Ji Ji and Wei Ji make a useful first comparison.',
        'Line numbers run upward, while a name such as Water over Fire gives the upper image first. Keep the two conventions separate.',
        'Earlier Heaven and Later Heaven diagrams arrange trigrams differently. You can learn the line patterns before studying directions; a learning diagram is not personal guidance about where to go.',
      ],
      figure: {
        caption: 'Eight three-line patterns, with their names and images',
        description:
          'Qian, Kun, Zhen, Xun, Kan, Li, Gen and Dui each have a distinct pattern. Read each pattern from bottom to top. The table uses that same order for its binary notation: 1 is solid and 0 is broken. This is a recognition chart, not a directional arrangement.',
      },
      table: {
        title: 'Trigram reference: binary notation runs bottom to top',
        columns: ['Name', 'Pattern', 'Traditional image', 'Recognition cue'],
        rows: [
          ['Qian 乾 ☰', '111', 'Heaven', 'Three solid lines'],
          ['Kun 坤 ☷', '000', 'Earth', 'Three broken lines'],
          ['Zhen 震 ☳', '100', 'Thunder', 'Solid line at the bottom'],
          ['Xun 巽 ☴', '011', 'Wind', 'Broken line at the bottom'],
          ['Kan 坎 ☵', '010', 'Water', 'Solid line in the middle'],
          ['Li 离 ☲', '101', 'Fire', 'Broken line in the middle'],
          ['Gen 艮 ☶', '001', 'Mountain', 'Solid line at the top'],
          ['Dui 兑 ☱', '110', 'Lake', 'Broken line at the top'],
        ],
      },
      example: {
        title: 'Swap the trigrams: After Completion and Before Completion',
        intro:
          'Draw Li on one piece of paper and Kan on another. Use only stable lines for this exercise: write 7 for solid and 8 for broken. The task is to inspect the arrangement, not to make a cast.',
        steps: [
          'Place Li below Kan. From the bottom upward, the values are 7, 8, 7, 8, 7, 8. Fire is below Water: Ji Ji 既济, number 63, commonly called After Completion.',
          'Exchange the two groups without changing the order of the three lines inside either group. The values become 8, 7, 8, 7, 8, 7: Fire over Water, Wei Ji 未济, number 64, Before Completion.',
          'Check what you actually did. You exchanged two trigrams. You did not generate any 6s or 9s through a coin toss. These are two separate samples for a construction exercise.',
          'When reading a source, distinguish the hexagram’s name, its overall text and the texts for individual positions. Ask an Agent to identify Ji Ji’s lower and upper trigrams with a source before requesting an interpretation.',
        ],
        conclusion:
          '“It contains Water and Fire” leaves out decisive information. Keep the sequence and both positions in your record so a person or Agent can reconstruct the exact figure.',
      },
      faq: [
        {
          question: 'Do 63 and 64 rank the readings or measure completion?',
          answer:
            'No. They are positions in the King Wen sequence. The names invite discussion of completion, but the numbers are neither success probabilities nor a personal progress bar. Read the actual passage and keep the question’s context in view.',
        },
        {
          question: 'Why is 100 Thunder rather than Mountain?',
          answer:
            'The first digit here represents the bottom line. Therefore 100 is solid below two broken lines. A source that writes top to bottom will reverse that notation. Include “bottom-to-top” whenever you share a bare bit string.',
        },
        {
          question: 'Does the Water trigram mean rain is coming?',
          answer:
            'The association belongs to a traditional symbolic system, not a weather observation. A specific divination method may use images in its own way, but it must supply those additional rules. This recognition table alone makes no weather inference.',
        },
      ],
      glossary: [
        { term: 'Trigram / jing gua 经卦', definition: 'One of the eight possible three-line patterns.' },
        {
          term: 'Hexagram / chong gua 重卦',
          definition: 'A six-line figure made from an upper and lower trigram; there are 64 possible pairs.',
        },
        {
          term: 'Gua xiang 卦象',
          definition:
            'The figure’s structure or its associated imagery; a reader should specify which sense is intended.',
        },
      ],
    },
    sources: [
      source(
        '《易传》· 说卦',
        'https://zh.wikisource.org/wiki/易傳/說卦',
        '支撑八卦自然意象；本文认形口诀与练习是编辑整理。',
        'Primary text for natural-image associations; the recognition cues and exercise are editorial teaching aids.',
      ),
      source(
        '《周易》· 六十四卦索引',
        'https://zh.wikisource.org/wiki/周易',
        '用于核对既济、未济的名称与原典条目。',
        'Primary-text index for the names and passages of Ji Ji and Wei Ji.',
      ),
      product(
        'src/data/hexagrams.ts',
        '支撑问卜的底向上位码、八卦索引和文王卦序表。',
        'Documents Wenbu’s bottom-to-top bit strings, trigram indexes and King Wen lookup table.',
      ),
    ],
  },
  'tarot-beginner': {
    zh: {
      answer:
        '第一次读塔罗，完成一次“问题—牌面—联想—行动”的记录就足够。先限定一个真实情境，再选一张或三张牌；把牌名、位置、朝向与自己推想的意义分开保存。牌可以帮助提出问题，牌面本身不能替别人作证，也不会验证一项现实判断。',
      takeaways: [
        '78 张是牌组结构；当下、牵引、下一步是问卜三张牌的位置。牌名和位置需要一起读。',
        '先说看到什么，再说想到什么。观察“抽到宝剑二”和联想“我在回避决定”是不同性质的记录。',
        '一次练习最好落到一个能检查的小行动，例如索取一份资料、确认一个需求，而不只是留下好听的结论。',
      ],
      figure: {
        caption: '教学牌阵：当下、牵引、下一步',
        description:
          '三张示例牌依次为魔术师、宝剑二、星币八，均为正位，用问卜既有原创插画呈现。示例用于说明同一组牌怎样结合位置阅读，不是本页为读者随机抽出的结果。',
      },
      table: {
        title: '把四层信息写开，解读就更清楚',
        columns: ['记录层', '示例', '可以核对什么'],
        rows: [
          ['背景', '准备向合作方提议试做一个小项目', '项目目标、时间和已知约束'],
          ['抽牌事实', '当下：魔术师，正位', '牌名、朝向、牌阵位置'],
          ['个人联想', '我也许已有足够资源做一个小样', '是自己的假设，需要清点资源'],
          ['行动', '周五前做一页样稿，请对方确认范围', '是否完成、得到什么反馈'],
        ],
      },
      example: {
        title: '从三张牌写出一条可执行的记录',
        intro:
          '设定练习问题：“准备和朋友试做一个项目，我应该先澄清什么？”下面固定使用图中的三张牌，重点在记录方法，不在挑选最理想的结果。',
        steps: [
          '当下看魔术师。先记牌名和正位，再把“资源”具体化：已有技能、可用工具、每周空闲时间。暂不写“项目一定成功”。',
          '牵引看宝剑二。提出“是不是有一个决定还没说清”的假设，回查真实背景：例如谁负责最终确认。若已有明确负责人，就把这个联想划掉。',
          '下一步看星币八。把练习与打磨的联想转成低成本行动：先做一页样稿，而不是一次承担完整项目。',
          '合成一句记录：“本周用现有工具做一个样稿，先确认谁决定范围。”同时列出缺失信息：对方是否有时间、需要何时反馈。',
          '约定周五回看。记录样稿完成与否、对方实际说了什么、哪些联想没有对应上；不要事后把每个结果都改写成牌早已预告。',
        ],
        conclusion:
          '这次练习的成果是一份更明确的沟通准备。把资料交给 Agent 时，保留完整问题与牌阵位置，让它在你的记录上继续澄清，而不是另编一组牌或他人的心理。',
      },
      faq: [
        {
          question: '需要背完 78 张牌才能开始吗？',
          answer:
            '不用。先认识大小阿尔卡那、四种花色和本次牌阵的位置；一张牌也能练习。遇到不懂的牌，查它的来源和本次语境，不必立即背一长串孤立关键词。',
        },
        {
          question: '抽到死神或高塔，是不是会出事？',
          answer:
            '牌名和图像会引出强烈联想，但没有给出真实事件的证据。先查所用牌组与文本中的含义，再问哪些变化或不稳定已经有现实依据；没有依据时，不必为戏剧化图像安排一个灾祸故事。',
        },
        {
          question: '网页上的七张背面是不是只有七张候选牌？',
          answer:
            '不是。七张牌背是选牌交互，真正结果由完整 78 张牌组不放回抽取，一次三张不会重牌。点击某个位置并不对应一张预先固定、可以被猜中的牌。',
        },
      ],
      glossary: [
        {
          term: '大阿尔卡那',
          definition: '常见韦特体系中的 22 张大牌；它们属于牌组分类，不是事件严重程度的分级。',
        },
        {
          term: '牌阵位置',
          definition: '抽牌前约定的阅读问题，如当下、牵引、下一步；同一张牌在不同位置应回应不同问题。',
        },
        {
          term: '不放回抽取',
          definition: '一张牌被选中后，在本次牌阵剩余抽取中不再出现；与是否逆位是独立规则。',
        },
      ],
    },
    en: {
      answer:
        'For a first tarot reading, make one complete record: question, cards, associations and action. Choose a real situation, then draw one or three cards. Keep names, positions and orientations separate from your interpretation. A card can suggest a useful question; it cannot testify to someone else’s thoughts or verify an external claim.',
      takeaways: [
        'The 78 cards describe the deck’s structure. Situation, Tension and Next Step describe Wenbu’s three positions. Read the card and its position together.',
        'Distinguish observation from association. “I drew the Two of Swords” and “I may be avoiding a decision” are different kinds of statement.',
        'End with something you can check: request information, clarify a need or try a small task. A reassuring paragraph alone leaves little to revisit.',
      ],
      figure: {
        caption: 'A teaching spread: Situation, Tension, Next Step',
        description:
          'The Magician, Two of Swords and Eight of Pentacles appear upright using Wenbu’s original artwork. These fixed examples demonstrate positions; the page has not drawn random cards for the reader.',
      },
      table: {
        title: 'Four layers to keep in your reading record',
        columns: ['Layer', 'Example', 'What you can check'],
        rows: [
          [
            'Context',
            'Proposing a small trial project with a friend',
            'Goal, time available and known constraints',
          ],
          ['Drawn result', 'Situation: The Magician, upright', 'Name, orientation and position'],
          [
            'Association',
            'Perhaps I already have enough resources for a sample',
            'Inventory the resources; this is a hypothesis',
          ],
          [
            'Action',
            'Make a one-page sample by Friday and confirm its scope',
            'Completion and the other person’s response',
          ],
        ],
      },
      example: {
        title: 'Turn three cards into a useful project note',
        intro:
          'Use the question: “What should I clarify before trying a project with a friend?” Work with the three fixed cards in the illustration. This exercise is about recording a reading, not engineering a favorable draw.',
        steps: [
          'For Situation, record The Magician upright. Make “resources” concrete: relevant skills, tools and hours available. Do not jump from the image to a claim that the project will succeed.',
          'For Tension, use the Two of Swords to ask whether a decision is unresolved. Check the actual context: perhaps nobody has agreed who approves the scope. If a decision-maker is already confirmed, cross out that association.',
          'For Next Step, turn the Eight of Pentacles’ practice theme into a small task: produce one sample page before committing to the entire project.',
          'Write one sentence: “This week I will make a sample with existing tools and confirm who approves the scope.” List missing information, including your friend’s availability and the feedback deadline.',
          'Revisit the record on Friday. Note whether the sample was finished, what the person actually said and which associations did not fit. Keep the original wording so later events do not rewrite the reading.',
        ],
        conclusion:
          'The result is a clearer preparation for a conversation. Give an Agent the original question and spread positions so it can help clarify your record without inventing another draw or another person’s motives.',
      },
      faq: [
        {
          question: 'Must I memorize all 78 cards first?',
          answer:
            'No. Learn the broad categories, the four suits and the positions you are using. One card is enough for an exercise. Look up unfamiliar cards in a named source and return to the question rather than collecting disconnected keywords.',
        },
        {
          question: 'Does Death or The Tower mean something terrible will happen?',
          answer:
            'Dramatic imagery can produce a strong association, but it supplies no evidence of an event. Check the deck and text, then identify any change or instability already supported by real information. You do not need to invent a disaster to make the picture fit.',
        },
        {
          question: 'Are the seven card backs the only available cards?',
          answer:
            'No. They provide the selection interaction. Wenbu draws from all 78 cards without replacement, so three cards in one spread cannot repeat. A clickable position is not a fixed hidden card that you can reliably predict.',
        },
      ],
      glossary: [
        {
          term: 'Major Arcana',
          definition:
            'The 22 major cards in a common Rider–Waite–Smith-style deck; a deck category, not a severity rating.',
        },
        {
          term: 'Spread position',
          definition:
            'A question assigned before drawing, such as Situation or Next Step, which gives a card its immediate context.',
        },
        {
          term: 'Without replacement',
          definition:
            'Once drawn, a card cannot appear again in the same spread. This is separate from the reversal setting.',
        },
      ],
    },
    sources: [
      waite,
      source(
        'The Met · Before Fortune-Telling: The History and Structure of Tarot Cards',
        'https://www.metmuseum.org/perspectives/tarot-2',
        '补充牌组结构的历史背景；文物史与现代反思练习分开阅读。',
        'Museum account of deck structure and historical context, separate from modern reflective exercises.',
      ),
      product(
        'src/lib/tarot.ts',
        '支撑 78 张不放回抽取及三个牌阵位置。',
        'Supports the 78-card draw without replacement and the three spread positions.',
      ),
      product(
        'src/components/ToolDesk.tsx',
        '支撑网页七张牌背交互与牌数、逆位设置。',
        'Documents the seven-back selection interface, card-count control and reversal setting.',
      ),
    ],
  },
  'tarot-suits-and-court-cards': {
    zh: {
      answer:
        '花色提供讨论领域，宫廷身份提供一种观察角色；两者再与具体牌名、牌阵位置和问题结合，才构成一次阅读。权杖、圣杯、宝剑、星币各有 14 张，侍从、骑士、王后、国王是每组中的四张宫廷牌。把宫廷牌读成做事姿态，是一种入门练习，不是固定的人物识别规则。',
      takeaways: [
        '先做分类题：它是大牌、数字牌还是宫廷牌？再看它处于哪个位置，避免用一个关键词解释一切。',
        '花色提示并非互斥。工作问题也涉及圣杯的关系与回应，关系问题也需要星币的时间和日常投入。',
        '王后、国王等名称保留历史角色称谓；实际练习不要求给身边的人分配性别、年龄或身份。',
      ],
      figure: {
        caption: '四张 Ace，四种提问的入口',
        description:
          '用问卜原创的权杖一、圣杯一、宝剑一、星币一并列展示四种花色。它们共用数字起点，却指向不同的练习问题；插画是现代创作，不作为历史韦特牌图的逐项符号证据。',
      },
      table: {
        title: '把花色和宫廷角色转成练习问题',
        columns: ['线索', '本课采用的观察角度', '可以写进记录的问题'],
        rows: [
          ['权杖 Wands', '意愿、行动、持续投入', '我愿意为这件事持续做什么？'],
          ['圣杯 Cups', '感受、关系、回应', '有哪些需要尚未说出来？'],
          ['宝剑 Swords', '判断、语言、分歧', '哪句话是事实，哪句话是猜测？'],
          ['星币 Pentacles', '资源、技能、日常实践', '现有时间与技能支持哪一步？'],
          ['侍从 Page', '带着问题学习', '我需要先弄懂哪个基础？'],
          ['骑士 Knight', '尝试推进', '要推进什么，速度是否合适？'],
          ['王后 Queen', '照顾过程、培养熟练', '怎样让这件事稳定地继续？'],
          ['国王 King', '组织、承担、作出安排', '谁负责决定，谁承担代价？'],
        ],
      },
      example: {
        title: '同一项目，四种姿态：以星币宫廷牌练习',
        intro:
          '假设你正在准备一个手作摊位。以下是固定的学习对照，不是一次抽到四张牌，也不是职业或财富预测。把“资源与实践”当作共同主题。',
        steps: [
          '星币侍从：以学习姿态列出最小未知项，例如包装尺寸或定价成本。下一步可以是完成一个样品并记录材料消耗。',
          '星币骑士：以持续执行的姿态检查进度。写出每天能稳定完成多少件，而不是仅凭热情承诺一个无法交付的数量。',
          '星币王后：以照顾流程的姿态检查工作条件。考虑储存、休息、布置和谁需要协助，让产出方式能持续。',
          '星币国王：以承担与组织的姿态明确预算和责任。确认支出上限、库存由谁保管、何时停止追加投入；这些是现实管理问题。',
          '回到真实牌阵时，只使用实际抽到的牌及其位置。如果同一角色提问并不贴合情境，写明不适用，不必凑齐四种姿态。',
        ],
        conclusion:
          '这个练习帮助你建立“花色 × 姿态”的记忆框架。四个角色没有成熟度排名；具体牌面与经典条目可能提供不同细节，之后仍需逐张学习。',
      },
      faq: [
        {
          question: '星币就是钱，圣杯就是恋爱吗？',
          answer:
            '这是过窄的简化。本文用星币提醒实践条件，用圣杯提醒感受与回应；预算可以出现在家庭问题中，情绪也会出现在工作合作中。先读问题，再决定哪些联想有实际用途。',
        },
        {
          question: '能不能用国王牌确认某个男人的身份？',
          answer:
            '不能仅凭宫廷牌确认性别、年龄、职业或动机。你可以记“我联想到某个人”，再说明来自哪些现实经历；这和牌已经识别了该人是两回事。',
        },
        {
          question: '别的牌组叫金币或圆盘，是否不一样？',
          answer:
            '花色译名与体系确实会变化。记录时同时保存牌组名称和原文牌名，不要只凭译名合并条目。问卜使用 Pentacles／星币；研究另一体系时，先读该牌组自己的指南。',
        },
      ],
      glossary: [
        { term: '花色 Suit', definition: '小阿尔卡那的四个系列；每个系列都包含数字牌与宫廷牌。' },
        {
          term: '宫廷牌 Court card',
          definition: '常见韦特体系中的侍从、骑士、王后、国王；可讨论角色或姿态，但不自动对应现实人物。',
        },
        { term: '数字牌', definition: '每种花色中 Ace 至十的十张牌；数字相同不表示跨花色牌义完全相同。' },
      ],
    },
    en: {
      answer:
        'A suit supplies a field of attention; a court rank can suggest an approach. Combine both with the particular card, its spread position and your question. Wands, Cups, Swords and Pentacles each have 14 cards, including Page, Knight, Queen and King. Reading those ranks as approaches is a learning exercise, not a rule for identifying people.',
      takeaways: [
        'Classify the card first: major, numbered minor or court card. Then read its position. One keyword cannot do the work of the whole spread.',
        'The suits are not exclusive compartments. Work involves feelings and relationships; relationships also require time, skills and practical care.',
        'Court titles preserve historical roles. A reflective exercise does not require assigning people a gender, age or fixed identity from a card.',
      ],
      figure: {
        caption: 'Four Aces, four starting questions',
        description:
          'Wenbu’s original Aces of Wands, Cups, Swords and Pentacles introduce the four suits. Each shares the same rank but opens a different question. These modern illustrations are not evidence for every symbol in the historical Rider–Waite–Smith deck.',
      },
      table: {
        title: 'Turn a suit or court rank into a question',
        columns: ['Clue', 'Approach used in this exercise', 'A question for your record'],
        rows: [
          ['Wands', 'Motivation, action, sustained effort', 'What am I willing to keep doing?'],
          ['Cups', 'Feelings, relationships, responses', 'Which needs have not been expressed?'],
          ['Swords', 'Judgment, language, disagreement', 'What is fact, and what is an assumption?'],
          ['Pentacles', 'Resources, skills, daily practice', 'What do my current resources support?'],
          ['Page', 'Learning through questions', 'Which basic point should I understand first?'],
          ['Knight', 'Putting something into motion', 'What needs to move, and at what pace?'],
          ['Queen', 'Tending a process and developing skill', 'What would make this sustainable?'],
          ['King', 'Organizing and taking responsibility', 'Who decides, and who carries the cost?'],
        ],
      },
      example: {
        title: 'One project, four approaches: the Pentacles court',
        intro:
          'Imagine preparing a small craft stall. This fixed comparison is a study exercise, not a four-card draw or a financial forecast. Keep resources and practice as the shared subject.',
        steps: [
          'As a Page, identify a basic unknown: package dimensions or the material cost per item. Make one sample and record what it uses before estimating a whole batch.',
          'As a Knight, consider repeatable effort. Establish how many pieces you can reliably finish each day instead of promising a volume supported only by enthusiasm.',
          'As a Queen, inspect the working conditions. Storage, rest, presentation and help from others may make the process easier to sustain.',
          'As a King, clarify responsibility and limits. Agree who manages stock, what the spending ceiling is and when to stop adding commitments. These are practical management questions.',
          'In an actual spread, return to the card and position that were drawn. If an approach does not fit the situation, record that. You do not need to make every role apply.',
        ],
        conclusion:
          'The exercise builds a memory aid from suit and approach. It is not a ladder of maturity. Individual cards and historical entries contain distinctions that you will still need to study separately.',
      },
      faq: [
        {
          question: 'Do Pentacles always mean money and Cups always mean romance?',
          answer:
            'That is too narrow. Here, Pentacles invite practical questions and Cups invite questions about feelings and responses. A family discussion can involve budgets; a work project can involve disappointment. Begin with the situation before choosing an association.',
        },
        {
          question: 'Can a King identify a particular man?',
          answer:
            'A court card alone cannot establish someone’s gender, age, job or motives. You can write that it reminds you of a person and explain the real experiences behind that association. That is different from claiming the card has identified them.',
        },
        {
          question: 'What if another deck uses Coins or Disks?',
          answer:
            'Names and systems vary. Save the deck name and original card title rather than merging entries on a translated label alone. Wenbu uses Pentacles. When studying a different system, consult the guide for that deck first.',
        },
      ],
      glossary: [
        {
          term: 'Suit',
          definition: 'One of the four Minor Arcana series, each containing numbered cards and court cards.',
        },
        {
          term: 'Court card',
          definition:
            'A Page, Knight, Queen or King in a common Rider–Waite–Smith-style deck; not automatically a real person.',
        },
        {
          term: 'Numbered minor',
          definition:
            'An Ace-through-Ten card. The same rank in different suits does not guarantee the same meaning.',
        },
      ],
    },
    sources: [
      source(
        'A. E. Waite · The Pictorial Key to the Tarot, Part I',
        'https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_1',
        '用于核对四种花色与宫廷等级；本课的角色提问框架不是对历史人物判词的照搬。',
        'Primary source for the suits and court ranks. The role-based questions are an original teaching framework.',
      ),
      waite,
      product(
        'src/data/tarot.ts',
        '支撑问卜牌名与原创提示用语；牌组与提示不冒充经典逐字翻译。',
        'Documents Wenbu’s card names and original prompts, which are not presented as literal translations of a classic.',
      ),
    ],
  },
  'tarot-reversals': {
    zh: {
      answer:
        '逆位表示牌相对阅读方向倒置，不自动等于坏事，也不必把正位解释逐字取反。先选定一种阅读规则，再开始抽牌。问卜允许关闭“包含逆位”，新手可以全正位练习；需要逆位时，再明确它是受阻、过度、内化，还是某个来源的特定条目。',
      takeaways: [
        '方向是抽牌记录，意义是解释选择。保留原始方向，避免为了迎合结论而事后旋转牌面。',
        '开启逆位后，每张牌独立有一半概率逆位。一次三张全逆位的概率为 1/8，不是系统给运气打了低分。',
        '传统作者对逆位有具体且不完全一致的解释；本文的“受阻／过度”等问题是练习角度，不宣称唯一标准。',
      ],
      figure: {
        caption: '同一张太阳牌，两种朝向，一份原始记录',
        description:
          '左侧为太阳正位，右侧为同一插画旋转 180 度的逆位，牌名标签保持正向可读。韦特原著的太阳逆位条目保留正位主题但有所减弱，这个例子说明“逆位必定相反”并不成立。',
      },
      table: {
        title: '常见阅读选择：先说清用哪一种',
        columns: ['选择', '怎样提问', '需要避免的跳跃'],
        rows: [
          ['全正位', '结合牌名、问题和位置阅读', '把关闭逆位误当作只剩好结果'],
          ['受阻', '什么实际条件妨碍这个主题展开？', '没查背景就断言有人阻挠'],
          ['过度或不足', '投入是否过多，或缺少必要的一部分？', '同一句话同时解释所有情况'],
          ['内化', '这件事是否更多发生在自己的想法里？', '借此断言别人隐藏的感情'],
          ['来源特定条目', '所用作者对这张逆位牌写了什么？', '混用不同作者但不注明来源'],
        ],
      },
      example: {
        title: '用太阳牌比较“减弱”与“坏结果”',
        intro:
          '固定用太阳牌做朝向练习，问题是：“怎样准备周末展示，让我更清楚地表达成果？”这里不生成新的随机结果。',
        steps: [
          '先写规则：“这次对照韦特的太阳条目。”在原著中核对正、逆位描述，不把网络上任何一段太阳牌文案当成同一来源。',
          '若从正位联想到把成果展示出来，列出真实准备情况：已有演示、仍需练习的部分、希望观众理解的一点。',
          '逆位按较弱或受限的同类主题来练习。提出一个具体假设：“我的成果已成形，但还没找到清楚的表达方式。”这是假设，不能直接定为事实。',
          '检查假设：请一位朋友看两分钟演示并复述要点。若对方已经理解，记录该假设不符；若没理解，修改开场或补一个例子。',
          '保留牌面方向、所用来源、假设与反馈。不要把一次没讲清楚扩展成整场必然失败，也不要为消除不安连续重抽。',
        ],
        conclusion:
          '有价值的差别在于它引出了什么检查，而不在于把正位和逆位排成吉凶两栏。同一张牌的阅读约定保持明确，复盘才有意义。',
      },
      faq: [
        {
          question: '问卜现在是否默认全正位？',
          answer:
            '当前工具页“包含逆位”默认开启；API 省略 reversals 时也按 true 处理。想全正位，可在抽牌前取消勾选；Agent 或 API 调用则明确传 reversals: false。已有记录仍保留当时的正逆位。',
        },
        {
          question: '三张全部逆位，是不是结果很差？',
          answer:
            '开启逆位时，这种组合有 12.5% 的概率，属于普通随机结果。先核对设置，再按事先选择的阅读方法逐张看。逆位数量不构成情绪、关系或运气的测量。',
        },
        {
          question: '可不可以把逆位图片转正，方便看图？',
          answer:
            '查看细节时可以用单独的正向参考图，但记录必须仍标明原抽取为逆位。图片显示方向与原始抽牌字段应区分；不要静默改变记录，否则后续 Agent 无法复核你当时的读法。',
        },
      ],
      glossary: [
        { term: '正位 Upright', definition: '牌按约定的正常阅读方向出现；不等于全都是积极含义。' },
        { term: '逆位 Reversed', definition: '牌相对阅读方向倒置；具体如何解释取决于本次采用的约定和来源。' },
        {
          term: '阅读约定',
          definition: '开始前选定的牌阵、是否逆位及解释方法；它使同一份记录在复盘时保持可比。',
        },
      ],
    },
    en: {
      answer:
        'A reversal means a card appears upside down relative to the reading direction. It does not automatically mean bad news or the opposite of every upright meaning. Choose a convention before drawing. In Wenbu, beginners can turn off “Include reversed cards,” then introduce reversals later with a clearly named approach or source.',
      takeaways: [
        'Orientation belongs to the draw record; meaning belongs to interpretation. Keep the original orientation instead of changing it to suit a conclusion.',
        'With reversals on, each card has an independent 50% chance of reversal. Three reversed cards occur with probability 1/8; the system has not assigned your luck a low score.',
        'Historical authors offer specific reversal entries. Blockage, excess and inward focus are possible reflective approaches, not one universal historical rule.',
      ],
      figure: {
        caption: 'One Sun card, two orientations, a clear record',
        description:
          'The upright Sun appears beside the same illustration rotated 180 degrees; both name labels remain readable. Waite’s reversed Sun retains the upright theme in a diminished form, illustrating why reversal need not mean its opposite.',
      },
      table: {
        title: 'Name the approach before using it',
        columns: ['Approach', 'A question to ask', 'A leap to avoid'],
        rows: [
          [
            'Upright only',
            'How do the card and position address the question?',
            'Assuming all remaining meanings are positive',
          ],
          [
            'Blocked',
            'What real condition could hinder this theme?',
            'Inventing an obstructive person without evidence',
          ],
          [
            'Excess or lack',
            'Is something overdone or underdeveloped?',
            'Using one phrase to explain every possible outcome',
          ],
          [
            'Inward focus',
            'Is this mainly an internal concern?',
            'Claiming access to another person’s hidden feelings',
          ],
          [
            'Source-specific entry',
            'What does this author say about this card reversed?',
            'Mixing authors without identifying them',
          ],
        ],
      },
      example: {
        title: 'Compare a diminished theme with a “bad outcome”',
        intro:
          'Use The Sun as a fixed study card. Ask: “How can I present my work clearly this weekend?” No new random result is being generated in this exercise.',
        steps: [
          'State the rule: “I am comparing Waite’s Sun entries.” Check the upright and reversed descriptions in that text instead of assuming every online Sun description belongs to the same tradition.',
          'For the upright card, an association with showing your work might prompt an inventory: the demo you have, the part that needs rehearsal and the one point the audience should remember.',
          'For the reversal, explore a similar theme that is less fully expressed. Try the hypothesis: “The work is ready, but I have not found a clear way to explain it.” Treat this as a possibility, not an established fact.',
          'Test it by asking a friend to watch a two-minute demonstration and repeat the main point. If they understand, note that the hypothesis did not fit. If they do not, revise the opening or add an example.',
          'Keep the orientation, source, hypothesis and feedback together. One unclear explanation does not establish that the whole event will fail. A fresh draw is not needed to remove an uncomfortable feeling.',
        ],
        conclusion:
          'The useful difference is the check the reading suggests. Keeping the convention stable makes review possible; sorting orientations into a good column and a bad column does not.',
      },
      faq: [
        {
          question: 'Does Wenbu currently default to upright-only readings?',
          answer:
            'No. “Include reversed cards” is currently enabled on the tool page, and the API defaults an omitted reversals field to true. Uncheck the setting before drawing, or explicitly send reversals: false through an Agent or API. Existing records keep their original orientations.',
        },
        {
          question: 'Are three reversals a bad result?',
          answer:
            'With reversals enabled, that combination has a 12.5% probability. Check the setting and read each card using the convention chosen beforehand. The reversal count does not measure emotional health, relationship quality or luck.',
        },
        {
          question: 'Can I view a reversed image upright to inspect its details?',
          answer:
            'A separate upright reference image can help, but retain the original reversed label in your record. Display orientation and recorded orientation are different things. Silently changing the record prevents another reader or Agent from checking the reading you actually made.',
        },
      ],
      glossary: [
        {
          term: 'Upright',
          definition:
            'Shown in the agreed normal reading direction; not a guarantee of a positive interpretation.',
        },
        {
          term: 'Reversed',
          definition:
            'Shown upside down relative to that direction, interpreted according to a stated convention.',
        },
        {
          term: 'Reading convention',
          definition:
            'The spread, reversal choice and interpretive approach fixed before drawing, so the record remains comparable later.',
        },
      ],
    },
    sources: [
      waite,
      product(
        'src/lib/tarot.ts',
        '支撑独立的 50% 逆位抽样；三张全逆位的概率由此推算。',
        'Supports independent 50% reversal sampling; the three-reversal probability follows from this rule.',
      ),
      product(
        'src/lib/schema.ts',
        '支撑 API 省略 reversals 时的默认值，以及显式 false 的调用方式。',
        'Documents the default for an omitted reversals parameter and explicit false for upright-only draws.',
      ),
      product(
        'src/components/ToolDesk.tsx',
        '支撑网页“包含逆位”的当前默认与用户选项。',
        'Documents the current browser default and the user-facing reversal control.',
      ),
    ],
  },
  'ziwei-twelve-palaces': {
    zh: {
      answer:
        '紫微斗数十二宫是一套传统主题分类，不是十二项人生评分。先看输入与排盘约定，再认宫名、宫位地支、主星及标记；需要比较时，才进一步看相关宫位。身宫叠加在十二宫之一，不是第十三宫；没有主星的“空宫”也不是该领域空白。',
      takeaways: [
        '地支位置与宫名是两套标签。两个人同样的“财帛宫”可能位于不同地支，不能只按屏幕上的固定格子找。',
        '传统“三方四正”讨论本宫、两处三合宫和对宫。以命宫为参照时，常见组合是命、财帛、官禄、迁移。',
        '问卜当前呈现主星、辅星名称、部分四化及大限年龄区间；这些字段不等于已经完成流年分析。',
      ],
      figure: {
        caption: '从命宫向外看：财帛、官禄与对宫迁移',
        description:
          '示意图在十二宫的关系中突出命宫、财帛、官禄、迁移，帮助理解三方四正。它是教学关系图，不是任何人的出生盘；没有给宫位赋予强弱、吉凶或预测分数。',
      },
      table: {
        title: '十二宫名称与可以自行核对的观察问题',
        columns: ['宫名', '传统主题索引', '现实记录可以从哪里开始'],
        rows: [
          ['命宫', '自我与处事', '我最近反复采用什么做事方式？'],
          ['兄弟', '手足与同辈', '同辈支持或分工有哪些真实例子？'],
          ['夫妻', '伴侣关系', '有哪些期待需要与当事人沟通？'],
          ['子女', '子女及相关关系', '照料和陪伴的实际安排是什么？'],
          ['财帛', '资源与收支', '时间和金钱实际流向哪里？'],
          ['疾厄', '身体相关传统分类', '已有健康记录是什么，需向谁咨询？'],
          ['迁移', '外部环境与出行', '改变环境后，哪些条件确实不同？'],
          ['交友／仆役', '朋友与协作', '合作的责任和沟通方式是否明确？'],
          ['官禄／事业', '工作与做事', '哪些任务有成果，哪些需要支持？'],
          ['田宅', '居所与家庭基础', '居住与储存安排是否适用？'],
          ['福德', '内在享受与精神生活', '哪些活动让我恢复，哪些消耗精力？'],
          ['父母', '父母与长辈', '有哪些已确认的需要或边界？'],
        ],
      },
      example: {
        title: '第一次认盘：围绕工作问题做一份结构笔记',
        intro:
          '先准备可靠的出生日期、当地钟表时间和工具要求的资料。下面只练习从结果里读取标签，不预设你的命宫或官禄宫里会有什么星。',
        steps: [
          '保存输入与方法：问卜采用输入的当地民用时间，不自动进行真太阳时校正；记录 iztro 版本、晚子时与闰月约定，作为跨工具比较的前提。',
          '在实际结果中找命宫，抄下地支和主星名称。若看到身宫标记，记录它落在哪一宫；不要再画一个额外宫格。',
          '选中官禄宫，分别记录主星、亮度、可见四化和辅星名称。若没有主星，写“无主星”，不要写成“没有工作能力”。',
          '回看财帛与迁移，将与命宫相关的四处标签列在一张纸上。先完成“出现了什么”的记录，再询问所用传统如何解释宫位关系。',
          '另写现实资料：当前职责、近期任务、已有反馈。请 Agent 将“盘面字段”“传统解释”“我提供的工作事实”分开，最后只列需要进一步核实的问题。',
        ],
        conclusion:
          '这份笔记的价值是让读者知道解释引用了哪一宫、哪一颗星。它不能从宫名直接推出职业、收入或某年的事件，也不能替代现实记录。',
      },
      faq: [
        {
          question: '命宫和身宫是不是两张不同的盘？',
          answer:
            '不是。它们是同一盘中的不同参考标记，身宫依规则落在十二宫之一。问卜结果用 isBody 标识该宫，页面中心的命主、身主也不要与命宫、身宫位置混为一谈。',
        },
        {
          question: '为什么同样的宫名在两个网站上位置不同？',
          answer:
            '先核对出生资料、时间处理、闰月约定与盘面布局。有的差异只是显示方式，有的确实是排盘前提不同。应对照宫名、地支与星曜三者，不宜仅比较截图中某一个格子的坐标。',
        },
        {
          question: '空宫应从对宫复制主星吗？',
          answer:
            '学习资料可能讨论“借对宫星曜”来参看，但这是解释方法，不是把原始主星字段改写。记录仍应保留本宫无主星，再注明使用了何种参照，方便后续复核。',
        },
      ],
      glossary: [
        { term: '本宫', definition: '当前作为讨论中心的宫位；换了问题或参照，所指宫位也可以改变。' },
        { term: '对宫', definition: '与本宫在十二宫结构中相对的宫位；命宫的对宫是迁移宫。' },
        {
          term: '三方四正',
          definition: '传统上把本宫、两处三合宫和对宫一起参看的关系框架，并非四个独立吉凶分数。',
        },
      ],
    },
    en: {
      answer:
        'Zi Wei Dou Shu’s twelve palaces are traditional categories, not twelve scores for your life. Check the birth inputs and chart conventions, then identify the palace name, earthly branch, major stars and markers. The Body Palace overlays one of the twelve; it is not a thirteenth palace. An “empty” palace means no major star, not an absent part of life.',
      takeaways: [
        'Earthly branches and palace names are different labels. Two people’s Wealth Palaces can occupy different branches; do not identify a palace only by its screen position.',
        'The traditional san fang si zheng relationship groups a reference palace, its two trine partners and its opposite. For the Life Palace, the group includes Wealth, Career and Travel.',
        'Wenbu shows major stars, supporting-star names, selected transformation markers and decadal age ranges. Those fields are not a completed annual reading.',
      ],
      figure: {
        caption: 'From the Life Palace: Wealth, Career and the opposite Travel Palace',
        description:
          'The teaching diagram highlights Life, Wealth, Career and Travel within the twelve-palace structure. It illustrates a traditional relationship, not a personal birth chart, and assigns no strength, fortune or prediction scores.',
      },
      table: {
        title: 'Palace names and questions grounded in your own records',
        columns: ['Palace', 'Traditional subject', 'A starting question'],
        rows: [
          ['命宫 · Life', 'Self and approach', 'Which approach have I been using repeatedly?'],
          ['兄弟 · Siblings', 'Siblings and peers', 'What actual support or division of effort exists?'],
          ['夫妻 · Partnership', 'Close partnership', 'Which expectations need a conversation?'],
          [
            '子女 · Children',
            'Children and related relationships',
            'What care arrangements are actually in place?',
          ],
          ['财帛 · Wealth', 'Resources and spending', 'Where do time and money currently go?'],
          ['疾厄 · Health', 'A traditional bodily category', 'What do existing health records establish?'],
          ['迁移 · Travel', 'External settings and movement', 'Which conditions change in a new setting?'],
          [
            '交友／仆役 · Friends',
            'Friendships and cooperation',
            'Are responsibilities and communication clear?',
          ],
          [
            '官禄／事业 · Career',
            'Work and undertaking tasks',
            'Where are results or support needs visible?',
          ],
          ['田宅 · Property', 'Home and household foundations', 'Do the practical arrangements work?'],
          ['福德 · Well-being', 'Inner life and enjoyment', 'Which activities restore or drain me?'],
          ['父母 · Parents', 'Parents and elders', 'What needs or boundaries are confirmed?'],
        ],
      },
      example: {
        title: 'Read the labels before discussing a work question',
        intro:
          'Start with a reliable birth date, local clock time and the other inputs the tool requires. This exercise reads the result without assuming which stars your Life or Career Palace will contain.',
        steps: [
          'Keep the inputs and method. Wenbu uses entered local civil time without automatic solar-time correction. Record the iztro version and its late-Zi and leap-month conventions before comparing tools.',
          'Find 命宫, the Life Palace, and copy its earthly branch and major-star names. If a Body Palace marker appears, note its location rather than drawing an extra box.',
          'Select 官禄, the Career Palace. Record major stars, brightness, visible transformations and supporting-star names separately. If it lacks a major star, write that—not “no ability to work.”',
          'Add the Wealth and Travel Palace labels to your notes. Complete this description of what is present before asking how a particular tradition interprets the relationship.',
          'Write actual work information on a separate line: responsibilities, recent tasks and feedback. Ask the Agent to distinguish chart fields, traditional interpretation and the facts you supplied before listing questions to investigate.',
        ],
        conclusion:
          'A useful reading makes its references traceable to a palace and star. A palace name alone cannot establish a profession, income or event in a particular year.',
      },
      faq: [
        {
          question: 'Are the Life and Body Palaces separate charts?',
          answer:
            'No. They are reference points within one chart. The Body Palace falls in one of the twelve, marked by isBody in Wenbu’s result. Also distinguish these locations from the 命主 and 身主 star labels shown in the chart summary.',
        },
        {
          question: 'Why does the same palace appear elsewhere on another site?',
          answer:
            'Compare the inputs, time handling, leap-month convention and layout. Some differences are visual; others reflect different calculation assumptions. Match the palace name, earthly branch and stars rather than the screen coordinates alone.',
        },
        {
          question: 'Should I copy the opposite stars into an empty palace?',
          answer:
            'Some traditions consult the opposite palace in interpretation. That does not change the original data. Keep “no major star” in the record and label any borrowed reference separately so another reader can reconstruct the method.',
        },
      ],
      glossary: [
        {
          term: 'Reference palace / ben gong 本宫',
          definition: 'The palace currently being examined; the reference can change with the question.',
        },
        {
          term: 'Opposite palace / dui gong 对宫',
          definition:
            'The palace facing the reference across the twelve-palace structure. Travel is opposite Life.',
        },
        {
          term: 'San fang si zheng 三方四正',
          definition:
            'A traditional grouping of the reference palace, two trine partners and its opposite, not four independent scores.',
        },
      ],
    },
    sources: [
      source(
        'iztro · 紫微斗数宫位系统',
        'https://iztro.com/learn/palace',
        '支撑宫名、地支与宫位关系的术语；对人生的解释仍按传统观点注明。',
        'Supports palace terminology and relationships, treated as a traditional framework rather than verified personal facts.',
      ),
      source(
        'iztro · 宫位 API',
        'https://iztro.com/posts/palace',
        '参考宫位对象与对宫、三方四正的程序化表达。',
        'Technical reference for palace objects, opposite palaces and related-palace operations.',
      ),
      product(
        'src/lib/ziwei.ts',
        '支撑问卜实际输入时间、引擎版本、身宫标记与结果字段范围。',
        'Documents the actual time convention, engine version, Body Palace marker and returned fields.',
      ),
    ],
  },
  'ziwei-four-transformations': {
    zh: {
      answer:
        '禄、权、科、忌是附着在星曜上的四化标记，不是四颗独立放置的新星，也不是可加减的吉凶分数。读一个标记时，至少说明“哪一层、哪一天干、哪颗星、哪一宫”。先核对规则映射，再讨论传统含义，才能避免把本命标签误说成今年的具体事件。',
      takeaways: [
        '生年四化、大限四化、流年四化与宫干四化使用的参照不同；同一个“化忌”必须连同来源层一起说明。',
        '甲干对应廉贞禄、破军权、武曲科、太阳忌，是问卜当前 iztro 默认表中的规则，不是对甲年出生者的统一人生结论。',
        '问卜简版保留主星的四化字段，辅星目前只返回名称。例如文昌、文曲等辅星的四化，不能仅凭当前画面缺失就判定不存在。',
      ],
      figure: {
        caption: '甲干四化：从规则输入到四个星曜标记',
        description:
          '图中甲干分别连向廉贞化禄、破军化权、武曲化科、太阳化忌，四条连线等权显示。图示只说明 iztro 默认表的对应关系，不指定个人宫位，也不把禄权科忌换算成分数。',
      },
      table: {
        title: '读四化时，连星曜与层次一起记录',
        columns: ['标记', '传统讨论的入门关键词', '甲干示例', '不要直接推成'],
        rows: [
          ['禄 Lu', '增加、所得、愿意投入', '廉贞化禄', '一定赚钱或只有好处'],
          ['权 Quan', '掌握、行动、承担', '破军化权', '一定升职或支配别人'],
          ['科 Ke', '表达、声誉、条理', '武曲化科', '一定考试成功或成名'],
          ['忌 Ji', '牵挂、阻力、待处理之处', '太阳化忌', '一定遭遇灾祸或关系失败'],
        ],
      },
      example: {
        title: '核查一句“太阳化忌”，究竟说了什么',
        intro:
          '假设你拿到一句说明：“这张盘太阳化忌。”暂时不接受后面任何事件判断，先要求补齐可检查的上下文。这个例子不指定任何读者的出生年或宫位。',
        steps: [
          '先问层次：是在说生年、本次流年，还是某宫宫干产生的四化？若只给“化忌”两个字，信息尚不完整。',
          '假设回答是“生年甲干”，对照当前表，太阳对应忌。保存表来源与引擎版本；不要直接从公历年份尾数推断，尤其要留意年界约定。',
          '在这张实际排出的盘上找太阳所在宫位，记录宫名及它旁边的四化字段。表决定标记附在哪颗星，出生盘决定该星落在哪一宫，这是两个核对步骤。',
          '将传统解释单列一栏，例如所用资料讨论关注或阻力；再单列个人背景。没有对方提供的现实资料，就不替他编一段关系经历。',
          '若对方进一步断言“今年会发生某事”，追问是否另算了流年、用了哪些关系和前提。只有本命字段与大限年龄区间，还不能构成这一年的完整分析。',
        ],
        conclusion:
          '完整可引用的表述应类似：“按所列默认表，生年甲干使太阳带忌标记；其在此盘的宫位为已核对字段。后续含义属于指定传统下的解释。”不要省略来源层，也不要把解释伪装成观测事实。',
      },
      faq: [
        {
          question: '四化可以相加成一个总分吗？',
          answer:
            '本文和问卜都没有这样的评分依据。禄与忌可能涉及不同星曜和不同层次，不能按加一、减一互相抵消。先记录具体关系，比分数更能保留信息。',
        },
        {
          question: '为什么屏幕上可能找不到完整四个标记？',
          answer:
            '当前结果只给主星保存 mutagen，辅星列表只含名称。默认表中丙干有文昌化科等辅星四化，所以这个简化视图可能少显示一项；缺失显示不等于引擎规则里没有该项。',
        },
        {
          question: '两个工具的四化不同，该怎样比较？',
          answer:
            '先确认同一出生资料、年界与四化层，再查看各自天干对应表和流派配置。记录实际差异在哪一干、哪一星，避免把全部差异笼统说成“一个更准”。',
        },
      ],
      glossary: [
        {
          term: '生年四化',
          definition: '以出生年天干为规则输入产生的本命四化；需要连同引擎的年界约定核对。',
        },
        { term: '宫干四化', definition: '以某宫的天干为参照讨论的四化；与生年四化不属于同一来源层。' },
        {
          term: 'mutagen',
          definition: 'iztro 及问卜主星结果中承载四化标记的字段名；它是分类标签，不是数值强度。',
        },
      ],
    },
    en: {
      answer:
        'Lu, Quan, Ke and Ji are transformation labels attached to stars. They are not four new objects placed independently, nor scores to add and subtract. Identify the chart layer, the heavenly stem, the star and its palace before interpreting a marker. A natal label alone does not describe an event in the current year.',
      takeaways: [
        'Natal, decadal, annual and palace-stem transformations use different references. A label such as Ji must travel with the layer that produced it.',
        'The current default iztro table maps Jia to Lian Zhen–Lu, Po Jun–Quan, Wu Qu–Ke and Tai Yang–Ji. This is a rule, not a shared life outcome for everyone born in a Jia year.',
        'Wenbu’s compact result preserves transformation fields for major stars, but only names for supporting stars. A missing marker for a supporting star does not establish that the full chart lacks it.',
      ],
      figure: {
        caption: 'Jia transformations: one rule input, four star labels',
        description:
          'Jia links to Lian Zhen–Lu, Po Jun–Quan, Wu Qu–Ke and Tai Yang–Ji, with equal visual weight. The diagram shows the default table mapping, not a person’s palace placements or a fortune score.',
      },
      table: {
        title: 'Keep the star and chart layer with each transformation',
        columns: ['Label', 'Introductory traditional themes', 'Jia example', 'Do not jump to'],
        rows: [
          [
            'Lu 禄',
            'Increase, gain, willing involvement',
            'Lian Zhen 廉贞 → Lu',
            'Guaranteed income or only benefits',
          ],
          ['Quan 权', 'Control, initiative, responsibility', 'Po Jun 破军 → Quan', 'A guaranteed promotion'],
          ['Ke 科', 'Expression, reputation, order', 'Wu Qu 武曲 → Ke', 'Certain exam success or fame'],
          [
            'Ji 忌',
            'Preoccupation, friction, an unresolved concern',
            'Tai Yang 太阳 → Ji',
            'A guaranteed disaster or failed relationship',
          ],
        ],
      },
      example: {
        title: 'What does “Tai Yang transforms to Ji” actually establish?',
        intro:
          'Suppose a reading says, “Tai Yang carries Ji in this chart.” Before accepting a prediction attached to that sentence, request the missing context. This example does not assign you a birth year or palace.',
        steps: [
          'Identify the layer: is the reader discussing a natal, annual or palace-stem transformation? The label alone is incomplete.',
          'Suppose the answer is “natal Jia stem.” Check the table: Tai Yang maps to Ji. Record the table and engine version; do not infer the stem from a Gregorian year without checking the year-boundary convention.',
          'Find Tai Yang in the actual calculated chart and record its palace and transformation field. The table supplies the star’s label; the birth chart supplies its palace placement. These are separate checks.',
          'Put the traditional interpretation in another column. If a source discusses attention or friction, name that source. Put the user’s circumstances alongside it without inventing a relationship history they have not supplied.',
          'If the reader then predicts an event this year, ask whether an annual chart was calculated and which additional relationships were used. Natal fields and a displayed age range are not a complete annual analysis.',
        ],
        conclusion:
          'A traceable statement names the default table, the natal Jia input, the Tai Yang–Ji mapping and the verified palace field. Any further meaning belongs to a stated interpretive tradition, not to an observed event.',
      },
      faq: [
        {
          question: 'Can I combine the four labels into a total score?',
          answer:
            'Wenbu provides no basis for that scoring method. Lu and Ji can involve different stars and layers; adding one point and subtracting another erases those distinctions. Keep the relationships instead of inventing a numerical balance.',
        },
        {
          question: 'Why might fewer than four markers appear?',
          answer:
            'The current compact response retains mutagen only for major stars. Supporting stars return names. For example, the default Bing table includes Wen Chang–Ke, a supporting-star transformation, which this view does not preserve as a marker.',
        },
        {
          question: 'How should I compare different results from two tools?',
          answer:
            'Match the birth inputs, year boundary and transformation layer first. Then compare the heavenly-stem tables and school settings. Identify the exact stem and star where they differ rather than calling one entire tool more accurate.',
        },
      ],
      glossary: [
        {
          term: 'Natal transformations',
          definition:
            'Transformations keyed to the birth year’s heavenly stem, subject to the engine’s stated year-boundary convention.',
        },
        {
          term: 'Palace-stem transformations',
          definition:
            'Transformations discussed with a particular palace’s heavenly stem as the reference, a different layer from the natal year.',
        },
        {
          term: 'mutagen',
          definition:
            'The field used for a transformation label in iztro and Wenbu’s major-star result; it is categorical, not a strength value.',
        },
      ],
    },
    sources: [
      source(
        'iztro · 紫微斗数四化',
        'https://iztro.com/learn/mutagen',
        '支撑四化依附星曜、来源层和传统主题；不将作者解释当作验证过的人生预测。',
        'Supports attached labels, reference layers and traditional themes; interpretive claims are not treated as validated predictions.',
      ),
      source(
        'iztro v2.6.1 · heavenlyStems.ts',
        'https://github.com/SylarLong/iztro/blob/v2.6.1/src/data/heavenlyStems.ts',
        '支撑甲干四化及丙干文昌化科的版本固定规则表。',
        'Versioned source for the Jia mapping and the Bing–Wen Chang–Ke example.',
      ),
      product(
        'src/lib/ziwei.ts',
        '支撑当前主星保留四化、辅星仅返回名称及未计算流年的产品边界。',
        'Documents the preserved major-star labels, name-only supporting stars and lack of an annual-chart calculation in this result.',
      ),
    ],
  },
};
