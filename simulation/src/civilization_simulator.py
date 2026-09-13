"""
项目12：大规模多轮文明迭代数值仿真
=====================================
模拟两种文明原型在不同人口规模、位面环境下的几百轮演化：
  1. 掠夺文明（Predatory）——强者支配弱者，高消耗、 boom-bust 循环
  2. 锚点共生文明（Anchor Symbiotic）——万族共和、资源循环、稳态增长

输出：
  - output/civilization_evolution_full.csv   全量逐轮数据（场景×轮次）
  - output/civilization_evolution_summary.csv  场景级汇总指标
  - output/civilization_evolution_presets.csv  供项目3网页沙盘使用的预设案例曲线
  - logs/simulation_run.log                    运行日志
"""

import csv
import math
import os
import random
import time
from dataclasses import dataclass, field
from typing import List, Dict, Tuple

# ============================================================
# 全局配置
# ============================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

TOTAL_ROUNDS = 500  # 每场景迭代轮数（一轮≈一个时代/百年）
RANDOM_SEED = 20260910


# ============================================================
# 位面环境参数
# ============================================================
@dataclass
class Environment:
    name: str
    resource_abundance: float   # 资源丰度 0.2~1.5
    disaster_freq: float        # 灾害频率 0.0~1.0
    carrying_base: float        # 基础环境承载力系数
    renewable_rate: float       # 资源自然再生率


ENVIRONMENTS = [
    Environment("贫瘠位面",  0.35, 0.15, 0.6, 0.02),
    Environment("普通位面",  0.70, 0.30, 1.0, 0.05),
    Environment("富饶位面",  1.20, 0.20, 1.6, 0.08),
    Environment("灾厄位面",  0.50, 0.70, 0.8, 0.03),
]

# 初始人口规模（单位：万）
POPULATION_LEVELS = [
    ("小型部落",   10),
    ("城邦文明",  100),
    ("大陆文明", 1000),
    ("星际文明", 10000),
]


# ============================================================
# 文明状态
# ============================================================
@dataclass
class CivState:
    round_num: int = 0
    population: float = 0.0        # 人口（万）
    resources: float = 0.0         # 资源总量
    tech_level: float = 0.0        # 科技/文明等级
    stability: float = 0.0         # 稳定性 0~1
    happiness: float = 0.0         # 幸福度 0~1
    conflict_count: int = 0        # 累计重大冲突次数
    env_degradation: float = 0.0   # 环境破坏度 0~1
    military_power: float = 0.0    # 军事力量
    knowledge: float = 0.0         # 知识积累
    per_capita_resource: float = 0.0
    carrying_capacity: float = 0.0
    alive: bool = True
    collapse_round: int = -1


# ============================================================
# 仿真引擎基类
# ============================================================
class CivilizationSimulator:
    """文明仿真基类，子类实现具体动力学方程。"""

    civ_type: str = "base"
    civ_label: str = "基础文明"

    def __init__(self, env: Environment, init_pop: float, seed: int = RANDOM_SEED):
        self.env = env
        self.rng = random.Random(seed)
        self.state = CivState()
        self.state.population = init_pop
        # 初始科技按文明规模梯度设定（部落→星际）
        if init_pop <= 50:
            init_tech = 1.0
        elif init_pop <= 500:
            init_tech = 3.0
        elif init_pop <= 5000:
            init_tech = 6.0
        else:
            init_tech = 10.0
        self.state.tech_level = init_tech
        self.state.knowledge = init_tech * 20.0
        self.state.resources = init_pop * 80.0 * env.resource_abundance * (1.0 + 0.1 * init_tech)
        self.state.stability = 0.7
        self.state.happiness = 0.6
        self.state.military_power = init_pop * 0.1
        self.history: List[CivState] = []

    def _carrying_capacity(self) -> float:
        """环境承载力 = 基础承载力 × 资源丰度 × (1-环境破坏) × 科技修正"""
        tech_mod = 1.0 + 0.25 * math.log1p(max(self.state.tech_level, 0.1))
        return (self.env.carrying_base * self.env.resource_abundance
                * (1.0 - 0.6 * self.state.env_degradation) * tech_mod
                * 10000.0)  # 单位：万人口承载

    def _disaster_impact(self) -> float:
        """每轮灾害冲击"""
        if self.rng.random() < self.env.disaster_freq:
            severity = self.rng.uniform(0.05, 0.25)
            return severity
        return 0.0

    def step(self) -> CivState:
        """执行一轮迭代，子类重写 _dynamics。"""
        s = self.state
        s.round_num += 1
        if not s.alive:
            self.history.append(self._snapshot())
            return self.state

        disaster = self._disaster_impact()
        self._dynamics(disaster)

        # 通用后处理
        s.carrying_capacity = self._carrying_capacity()
        s.per_capita_resource = s.resources / max(s.population, 1.0)

        # 崩溃判定：人口归零 或 稳定性长期为0
        if s.population <= 1.0:
            s.population = 0.0
            s.alive = False
            if s.collapse_round < 0:
                s.collapse_round = s.round_num
        if s.stability <= 0.005 and s.round_num > 120:
            # 稳定性为0时人口缓慢流失（社会解体）
            s.population *= 0.96

        self.history.append(self._snapshot())
        return self.state

    def _dynamics(self, disaster: float):
        """子类实现：核心动力学方程。"""
        raise NotImplementedError

    def _snapshot(self) -> CivState:
        s = self.state
        return CivState(
            round_num=s.round_num, population=round(s.population, 2),
            resources=round(s.resources, 2), tech_level=round(s.tech_level, 4),
            stability=round(s.stability, 4), happiness=round(s.happiness, 4),
            conflict_count=s.conflict_count,
            env_degradation=round(s.env_degradation, 4),
            military_power=round(s.military_power, 2),
            knowledge=round(s.knowledge, 2),
            per_capita_resource=round(s.per_capita_resource, 4),
            carrying_capacity=round(s.carrying_capacity, 2),
            alive=s.alive, collapse_round=s.collapse_round,
        )

    def run(self, rounds: int = TOTAL_ROUNDS) -> List[CivState]:
        for _ in range(rounds):
            self.step()
        return self.history


# ============================================================
# 掠夺文明（Predatory Civilization）
# ============================================================
class PredatorySimulator(CivilizationSimulator):
    """
    掠夺文明动力学：
    - 资源获取：靠军事力量掠夺外部/底层，高消耗
    - 人口：高出生率 + 战争/饥荒高死亡率 → boom-bust
    - 科技：军事导向，快但不稳定
    - 稳定性：低，阶级矛盾周期性爆发
    - 环境：高破坏，资源不可持续
    """
    civ_type = "predatory"
    civ_label = "掠夺文明"

    def _dynamics(self, disaster: float):
        s = self.state
        pop = s.population
        rng = self.rng

        # --- 资源端 ---
        # 掠夺收入：军事力量 × 掠夺效率 × 可掠夺资源（随时间递减，因为邻邦被抢光）
        depletion = min(1.0, s.round_num / 250.0)
        plunder_income = (s.military_power * 20.0
                          * self.env.resource_abundance
                          * (1.0 - 0.5 * depletion)
                          * (0.7 + 0.6 * rng.random()))
        # 自身生产（低效率，因为不事生产）
        self_production = pop * 1.5 * self.env.resource_abundance * (1.0 - 0.5 * s.env_degradation)
        # 消耗：高人均消耗 + 军备消耗
        consumption = pop * 2.5 * (1.0 + 0.15 * s.tech_level)
        military_upkeep = s.military_power * 1.5

        s.resources += plunder_income + self_production - consumption - military_upkeep
        s.resources = max(s.resources, 0.0)

        # --- 军事力量 ---
        # 掠夺文明把大量资源投入军备
        military_growth = 0.05 * pop * (1.0 + 0.2 * s.tech_level)
        military_decay = 0.03 * s.military_power * (1.0 - s.stability)
        s.military_power += military_growth - military_decay
        s.military_power = max(s.military_power, pop * 0.05)

        # --- 人口 ---
        # 掠夺文明：资源驱动增长，超载时饥荒加剧（无视承载力的代价）
        carrying = self._carrying_capacity()
        overpop_factor = max(1.0, pop / max(carrying, 1.0))
        if s.resources > consumption * 0.5:
            birth_rate = 0.045 * (1.0 - 0.3 * s.env_degradation) / math.sqrt(overpop_factor)
        else:
            birth_rate = 0.008
        famine_death = 0.0
        if s.resources < consumption * 0.3:
            famine_death = 0.05 * pop * overpop_factor
        elif s.resources < consumption * 0.5:
            famine_death = 0.015 * pop * overpop_factor
        # 战争死亡：稳定性越低，内战/外战越频繁
        war_death = (1.0 - s.stability) * 0.025 * pop * (0.5 + rng.random())
        if war_death > pop * 0.02:
            s.conflict_count += 1

        pop_change = pop * birth_rate - famine_death - war_death
        s.population = max(pop + pop_change, 0.0)

        # --- 科技 ---
        # 军事科技进步快，但基础科学投入不足
        tech_gain = 0.015 * s.knowledge * (1.0 + 0.4 * s.military_power / max(pop, 1)) / 100.0
        tech_loss = 0.003 * s.tech_level * (1.0 - s.stability)
        s.tech_level += tech_gain - tech_loss

        # --- 知识 ---
        s.knowledge += 0.6 * s.tech_level * (0.5 + 0.5 * s.stability)

        # --- 稳定性 ---
        # 阶级矛盾：资源分配极度不均，人均资源低则稳定性降
        inequality = 1.0 - min(1.0, s.per_capita_resource / 40.0)
        stability_drop = 0.025 * inequality + 0.015 * (1.0 - s.happiness)
        # 强人政治短暂维稳
        strongman_bonus = 0.008 * min(2.0, s.military_power / max(pop, 1))
        s.stability += strongman_bonus - stability_drop - disaster * 0.4
        s.stability = max(0.0, min(1.0, s.stability))

        # --- 幸福度 ---
        s.happiness = 0.3 * s.happiness + 0.7 * (
            0.4 * min(1.0, s.per_capita_resource / 30.0)
            + 0.3 * s.stability
            + 0.3 * (1.0 - s.env_degradation)
        )
        s.happiness = max(0.0, min(1.0, s.happiness))

        # --- 环境破坏 ---
        # 掠夺文明高污染、高消耗
        env_damage = 0.005 * pop / 1000.0 * (1.0 + 0.2 * s.tech_level)
        env_repair = self.env.renewable_rate * (1.0 - s.env_degradation) * 0.3
        s.env_degradation += env_damage - env_repair
        s.env_degradation = max(0.0, min(1.0, s.env_degradation))


# ============================================================
# 锚点共生文明（Anchor Symbiotic Civilization）
# ============================================================
class AnchorSymbioticSimulator(CivilizationSimulator):
    """
    锚点共生文明动力学：
    - 资源获取：循环经济、可再生、低消耗
    - 人口：规划性增长，S型曲线，不超过承载力
    - 科技：均衡发展，基础科学+民生科技
    - 稳定性：高，共和协商、权力制衡
    - 环境：低破坏，主动修复
    - 核心：万族共生契约，强者不支配弱者
    """
    civ_type = "anchor_symbiotic"
    civ_label = "锚点共生文明"

    def _dynamics(self, disaster: float):
        s = self.state
        pop = s.population
        rng = self.rng
        carrying = self._carrying_capacity()

        # --- 资源端 ---
        # 共生生产：高效循环 + 科技加成 + 环境友好
        production_efficiency = 1.0 + 0.3 * math.log1p(max(s.tech_level, 0.1))
        circular_bonus = 1.0 + 0.3 * (1.0 - s.env_degradation)
        production = (pop * 10.0 * self.env.resource_abundance
                      * production_efficiency * circular_bonus)
        # 低消耗：节俭+循环+科技去物质化（消耗随科技增长极慢）
        consumption = pop * 2.5 * (1.0 + 0.03 * s.tech_level)
        # 环境修复投入
        restoration_cost = pop * 0.2 * s.env_degradation

        s.resources += production - consumption - restoration_cost
        s.resources = max(s.resources, 0.0)

        # --- 军事力量（防御性，低比例）---
        military_growth = 0.01 * pop * (1.0 + 0.1 * s.tech_level)
        military_decay = 0.02 * s.military_power
        s.military_power += military_growth - military_decay
        s.military_power = max(s.military_power, pop * 0.02)

        # --- 人口：S型逻辑斯蒂增长，主动规划不超承载力 ---
        # 锚点文明具备规划能力：超载时主动减员，不依赖饥荒
        if pop > carrying * 1.05:
            target_growth = -0.02  # 严重超载：规划性减员
        elif pop > carrying * 0.9:
            target_growth = -0.005  # 接近超载：微减
        elif pop < carrying * 0.5:
            target_growth = 0.025  # 低基数时较快
        elif pop < carrying * 0.8:
            target_growth = 0.010
        else:
            target_growth = 0.001  # 接近承载力时主动减速
        # 资源约束
        resource_factor = min(1.0, s.resources / max(consumption, 1.0))
        if target_growth > 0:
            actual_growth = target_growth * resource_factor * (0.9 + 0.2 * rng.random())
        else:
            actual_growth = target_growth * (0.8 + 0.4 * rng.random())  # 减员不受资源约束
        # 饥荒死亡：资源严重不足时（规划失效的兜底）
        famine_death = 0.0
        if s.resources < consumption * 0.2:
            famine_death = 0.03 * pop
        # 灾害导致的少量损失
        disaster_loss = disaster * 0.2 * pop

        s.population = max(pop * (1.0 + actual_growth) - famine_death - disaster_loss, 0.0)

        # --- 科技：均衡发展 ---
        tech_gain = 0.02 * s.knowledge * (1.0 + 0.3 * s.happiness) / 100.0
        tech_loss = 0.001 * s.tech_level  # 几乎不倒退
        s.tech_level += tech_gain - tech_loss

        # --- 知识 ---
        s.knowledge += 1.0 * s.tech_level * s.stability

        # --- 稳定性：共和协商+权力制衡，天然高稳定 ---
        # 人均资源充足 → 稳定
        welfare = min(1.0, s.per_capita_resource / 35.0)
        consensus_bonus = 0.025 * welfare
        # 共生契约降低内部冲突（制度性基线）
        contract_bonus = 0.012 * (1.0 - s.env_degradation) + 0.005
        # 灾害和资源不足带来压力
        pressure = 0.008 * (1.0 - welfare) + disaster * 0.15
        s.stability += consensus_bonus + contract_bonus - pressure
        s.stability = max(0.0, min(1.0, s.stability))

        # --- 幸福度 ---
        s.happiness = 0.4 * s.happiness + 0.6 * (
            0.35 * min(1.0, s.per_capita_resource / 30.0)
            + 0.25 * s.stability
            + 0.20 * s.tech_level / max(s.tech_level + 5.0, 1.0)
            + 0.20 * (1.0 - s.env_degradation)
        )
        s.happiness = max(0.0, min(1.0, s.happiness))

        # --- 环境：主动修复，低破坏 ---
        env_damage = 0.002 * pop / 1000.0 * (1.0 + 0.1 * s.tech_level)
        env_repair = (self.env.renewable_rate * 2.0
                      * (1.0 - s.env_degradation)
                      * (1.0 + 0.5 * s.tech_level / 10.0))
        s.env_degradation += env_damage - env_repair
        s.env_degradation = max(0.0, min(1.0, s.env_degradation))


# ============================================================
# 批量运行
# ============================================================
def run_all_scenarios() -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """运行全部参数组合，返回 (全量逐轮数据, 场景汇总, 预设案例)。"""
    full_rows = []
    summary_rows = []
    preset_rows = []

    sim_classes = [PredatorySimulator, AnchorSymbioticSimulator]
    total_scenarios = len(sim_classes) * len(POPULATION_LEVELS) * len(ENVIRONMENTS)
    scenario_id = 0

    print(f"[仿真启动] 共 {total_scenarios} 个场景，每场景 {TOTAL_ROUNDS} 轮")
    print(f"[参数] 文明类型×{len(sim_classes)} 人口×{len(POPULATION_LEVELS)} 位面×{len(ENVIRONMENTS)}")

    for sim_cls in sim_classes:
        for pop_label, pop_val in POPULATION_LEVELS:
            for env in ENVIRONMENTS:
                scenario_id += 1
                seed = RANDOM_SEED + scenario_id * 137
                sim = sim_cls(env, pop_val, seed=seed)
                history = sim.run(TOTAL_ROUNDS)

                sid = f"S{scenario_id:03d}"
                # 全量逐轮
                for h in history:
                    full_rows.append({
                        "scenario_id": sid,
                        "civilization_type": sim_cls.civ_label,
                        "population_level": pop_label,
                        "initial_population": pop_val,
                        "environment": env.name,
                        "resource_abundance": env.resource_abundance,
                        "disaster_freq": env.disaster_freq,
                        "round": h.round_num,
                        "population": h.population,
                        "resources": h.resources,
                        "tech_level": h.tech_level,
                        "stability": h.stability,
                        "happiness": h.happiness,
                        "conflict_count": h.conflict_count,
                        "env_degradation": h.env_degradation,
                        "military_power": h.military_power,
                        "knowledge": h.knowledge,
                        "per_capita_resource": h.per_capita_resource,
                        "carrying_capacity": h.carrying_capacity,
                        "alive": int(h.alive),
                    })

                # 场景汇总
                final = history[-1]
                peak_pop = max(h.population for h in history)
                peak_pop_round = max(history, key=lambda h: h.population).round_num
                avg_stability = sum(h.stability for h in history) / len(history)
                avg_happiness = sum(h.happiness for h in history) / len(history)
                total_conflicts = final.conflict_count
                survived = int(final.alive)
                collapse_r = final.collapse_round if final.collapse_round > 0 else TOTAL_ROUNDS

                summary_rows.append({
                    "scenario_id": sid,
                    "civilization_type": sim_cls.civ_label,
                    "population_level": pop_label,
                    "initial_population": pop_val,
                    "environment": env.name,
                    "resource_abundance": env.resource_abundance,
                    "disaster_freq": env.disaster_freq,
                    "final_population": final.population,
                    "peak_population": peak_pop,
                    "peak_population_round": peak_pop_round,
                    "final_tech_level": final.tech_level,
                    "final_stability": final.stability,
                    "avg_stability": round(avg_stability, 4),
                    "avg_happiness": round(avg_happiness, 4),
                    "total_conflicts": total_conflicts,
                    "final_env_degradation": final.env_degradation,
                    "final_knowledge": final.knowledge,
                    "survived_500_rounds": survived,
                    "collapse_round": collapse_r,
                })

                # 预设案例曲线（供项目3沙盘使用）：每10轮采样一次
                for i in range(0, len(history), 10):
                    h = history[i]
                    preset_rows.append({
                        "scenario_id": sid,
                        "civilization_type": sim_cls.civ_label,
                        "population_level": pop_label,
                        "environment": env.name,
                        "round": h.round_num,
                        "population": h.population,
                        "tech_level": h.tech_level,
                        "stability": h.stability,
                        "happiness": h.happiness,
                        "env_degradation": h.env_degradation,
                        "conflict_count": h.conflict_count,
                    })

                status = "存续" if final.alive else f"崩溃(R{final.collapse_round})"
                print(f"  [{sid}] {sim_cls.civ_label} | {pop_label} | {env.name} "
                      f"→ 终局人口 {final.population:.0f}万 | 峰值 {peak_pop:.0f}万 | "
                      f"均稳定 {avg_stability:.3f} | 冲突 {total_conflicts} | {status}")

    return full_rows, summary_rows, preset_rows


def write_csv(rows: List[Dict], filepath: str):
    if not rows:
        print(f"[警告] 无数据写入 {filepath}")
        return
    fieldnames = list(rows[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[输出] {filepath}  ({len(rows)} 行)")


def main():
    start = time.time()
    log_path = os.path.join(LOG_DIR, "simulation_run.log")

    # 重定向输出到日志+控制台
    import sys
    class Tee:
        def __init__(self, *files):
            self.files = files
        def write(self, obj):
            for f in self.files:
                f.write(obj)
                f.flush()
        def flush(self):
            for f in self.files:
                f.flush()

    log_file = open(log_path, "w", encoding="utf-8")
    original_stdout = sys.stdout
    sys.stdout = Tee(sys.stdout, log_file)

    print("=" * 70)
    print("项目12：大规模多轮文明迭代数值仿真")
    print(f"启动时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"随机种子: {RANDOM_SEED}")
    print(f"迭代轮数: {TOTAL_ROUNDS}")
    print("=" * 70)

    full_rows, summary_rows, preset_rows = run_all_scenarios()

    # 写入CSV
    write_csv(full_rows, os.path.join(OUTPUT_DIR, "civilization_evolution_full.csv"))
    write_csv(summary_rows, os.path.join(OUTPUT_DIR, "civilization_evolution_summary.csv"))
    write_csv(preset_rows, os.path.join(OUTPUT_DIR, "civilization_evolution_presets.csv"))

    elapsed = time.time() - start
    print("\n" + "=" * 70)
    print(f"[仿真完成] 耗时 {elapsed:.2f} 秒")
    print(f"[数据量] 全量 {len(full_rows)} 行 | 汇总 {len(summary_rows)} 行 | 预设 {len(preset_rows)} 行")
    print(f"[场景数] {len(summary_rows)} 个")
    # 统计存活率
    pred_survive = sum(1 for r in summary_rows if r["civilization_type"] == "掠夺文明" and r["survived_500_rounds"])
    anchor_survive = sum(1 for r in summary_rows if r["civilization_type"] == "锚点共生文明" and r["survived_500_rounds"])
    pred_total = sum(1 for r in summary_rows if r["civilization_type"] == "掠夺文明")
    anchor_total = sum(1 for r in summary_rows if r["civilization_type"] == "锚点共生文明")
    print(f"[存活率] 掠夺文明 {pred_survive}/{pred_total} ({pred_survive/pred_total*100:.1f}%) | "
          f"锚点共生 {anchor_survive}/{anchor_total} ({anchor_survive/anchor_total*100:.1f}%)")
    print("=" * 70)

    sys.stdout = original_stdout
    log_file.close()
    print(f"日志已写入: {log_path}")


if __name__ == "__main__":
    main()
