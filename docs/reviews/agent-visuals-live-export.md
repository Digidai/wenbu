# 零点换日与子初换日：日柱从哪天算起

零点换日与子初换日都是排盘时对「一天从何时开始」的约定，只有出生时刻落在 23:00–24:00 时才会让日柱不同。问卜默认零点换日（sect=2），可选子初换日（sect=1）。两者都不改变年柱、月柱，因为年、月柱按绝对交节时刻判定。以下对比基于问卜已读取的编辑资料；本次未做实际排盘对照，也未核对 lunar\-typescript 源码在边界上的逐项行为。

## 零点换日 vs 子初换日

- **零点换日（问卜默认）**: 00:00 换日；23:00–24:00 出生仍算当日，日柱保留当日，时干按库的次日约定。
   Sources / 依据: [计算与依据](<https://wenbu.genedai.me/methodology/>); [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>)
- **子初换日（可选）**: 23:00 子时之始即换日；23:00–24:00 出生已算次日，日柱随之改变。
   Sources / 依据: [计算与依据](<https://wenbu.genedai.me/methodology/>); [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>)

共同点：年柱、月柱按绝对交节时刻判定，不受换日约定影响；00:00 后至 23:00 前日柱一致。差异仅在 23:00–24:00 出生时出现；本次未做实际排盘对照。

## 两种约定各自做什么

问卜采用 lunar-typescript 1.8.6。零点换日（默认，sect=2）把 00:00 当作日柱的换日点；子初换日（可选，sect=1）把 23:00 子时之始当作换日点。在默认规则下，晚子时的日柱保留当日，而时干按库的次日约定计算，这一约定会在命盘里注明。日柱、时柱采用选定的当地时钟，所以换日约定只作用于日柱（以及与之关联的时干约定）。

Sources / 依据: [计算与依据](<https://wenbu.genedai.me/methodology/>); [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>)

## 差异出现的范围

两种约定只在出生时刻落在 23:00 至 24:00 之间时才可能给出不同日柱：此时零点换日仍算当日，子初换日已算次日。其余时刻（00:00 之后至 23:00 之前）两种约定日柱相同。若出生时间本身未知，问卜不生成时柱，年、月柱以中午暂定并提示交节不确定性，此时讨论换日约定意义有限。

Sources / 依据: [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>); [计算与依据](<https://wenbu.genedai.me/methodology/>)

## 适用范围与未完成部分

本报告只说明问卜公开的计算约定，不代表某一流派是唯一正确做法；传统上两种换日方式各有使用者。真太阳时校正为经度与低阶均时差近似，不承诺天文历表级精度，接近时辰或换日边界时应比较校正前后结果，不能把近似数字当绝对答案。夏令时重复或缺失的钟表时间需要用户补充明确偏移，问卜不会替用户选择时刻。本次未做实际排盘对照，也未读取 lunar-typescript 源码细节，故 sect 参数在边界上的逐项行为仍属未完成核对部分。

Sources / 依据: [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>); [计算与依据](<https://wenbu.genedai.me/methodology/>)

## Questions / 继续思考

- 你有一个具体的出生日期与时刻想用来对照两种约定吗？
- 需要我按某个已知时刻分别用零点换日与子初换日排盘对比吗？
- 你的出生时间是否落在 23:00–24:00 之间？

## Sources / 参考资料

- [计算与依据](<https://wenbu.genedai.me/methodology/>)
- [出生时间、时区与真太阳时，怎样选才清楚？](<https://wenbu.genedai.me/learn/birth-time-timezone/>)

Generated with DeepSeek · Wenbu · Symbolic interpretation, not established prediction.
