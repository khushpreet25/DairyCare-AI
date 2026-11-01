import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Analytics.css";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function Analytics() {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [health, setHealth] = useState(null);
    const [milk, setMilk] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            setError("");

            const [
                statsResponse,
                healthResponse,
                milkResponse,
            ] = await Promise.all([
                api.get("/dashboard/stats"),
                api.get("/dashboard/health-summary"),
                api.get("/dashboard/milk-summary"),
            ]);

            setStats(statsResponse.data?.stats || {});

            setHealth(
                healthResponse.data?.summary || {}
            );

            setMilk(
                milkResponse.data?.milkSummary ||
                milkResponse.data?.summary ||
                {}
            );
        } catch (error) {
            console.error(
                "Analytics error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load analytics."
            );
        } finally {
            setLoading(false);
        }
    }

    /* =========================
       SAFE DATA VALUES
    ========================= */

    const totalFarms = stats?.totalFarms || 0;

    const totalAnimals =
        health?.totalAnimals ||
        stats?.totalAnimals ||
        0;

    const totalDietPlans =
        stats?.totalDietPlans || 0;

    const totalHealthRecords =
        stats?.totalHealthRecords || 0;

    const totalInjections =
        stats?.totalInjections || 0;

    const upcomingInjections =
        stats?.upcomingInjections || 0;

    const overdueInjections =
        stats?.overdueInjections || 0;

    const totalReminders =
        stats?.totalReminders || 0;

    const pendingReminders =
        stats?.pendingReminders || 0;

    const completedReminders =
        stats?.completedReminders || 0;

    /* =========================
       HEALTH DATA
    ========================= */

    const healthy =
        health?.healthyAnimals || 0;

    const attention =
        health?.attentionAnimals || 0;

    const critical =
        health?.criticalAnimals || 0;

    const pregnant =
        health?.pregnantAnimals || 0;

    const healthPercentage =
        totalAnimals > 0
            ? Math.round((healthy / totalAnimals) * 100)
            : 0;

    const attentionPercentage =
        totalAnimals > 0
            ? Math.round((attention / totalAnimals) * 100)
            : 0;

    const criticalPercentage =
        totalAnimals > 0
            ? Math.round((critical / totalAnimals) * 100)
            : 0;

    const pregnantPercentage =
        totalAnimals > 0
            ? Math.round((pregnant / totalAnimals) * 100)
            : 0;

    /* =========================
       CHART DATA
    ========================= */

    const farmOverviewData = [
        {
            name: "Farms",
            value: totalFarms,
        },
        {
            name: "Animals",
            value: totalAnimals,
        },
        {
            name: "Diet Plans",
            value: totalDietPlans,
        },
        {
            name: "Health Records",
            value: totalHealthRecords,
        },
        {
            name: "Injections",
            value: totalInjections,
        },
        {
            name: "Reminders",
            value: totalReminders,
        },
    ];

    const healthChartData = [
        {
            name: "Healthy",
            value: healthy,
            color: "#2E9B62",
        },
        {
            name: "Attention",
            value: attention,
            color: "#E6A23C",
        },
        {
            name: "Critical",
            value: critical,
            color: "#D9534F",
        },
    ].filter((item) => item.value > 0);

    /* =========================
       MILK DATA
    ========================= */

    const totalMilk =
        milk?.totalMilkProduction ??
        milk?.totalMilk ??
        milk?.total ??
        0;

    const averageMilk =
        milk?.averageMilkProduction ??
        milk?.averageMilk ??
        milk?.average ??
        0;

    const topProducer =
        milk?.topProducer ||
        milk?.topProducingAnimal ||
        null;

    const topProducerName =
        typeof topProducer === "object"
            ? topProducer?.name ||
              topProducer?.animalName ||
              "N/A"
            : topProducer || "N/A";

    const topProducerMilk =
        typeof topProducer === "object"
            ? topProducer?.milkProduction ||
              topProducer?.production ||
              0
            : 0;

    /* =========================
       INJECTION PERCENTAGE
    ========================= */

    const injectionProgress =
        totalInjections > 0
            ? Math.round(
                  ((totalInjections - overdueInjections) /
                      totalInjections) *
                      100
              )
            : 0;

    /* =========================
       REMINDER PERCENTAGE
    ========================= */

    const reminderProgress =
        totalReminders > 0
            ? Math.round(
                  (completedReminders /
                      totalReminders) *
                      100
              )
            : 0;

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="analytics-loading">
                    <div className="loading-spinner"></div>

                    <h2>Loading Analytics</h2>

                    <p>
                        Preparing your farm insights...
                    </p>
                </div>
            </div>
        );
    }

    /* =========================
       ERROR
    ========================= */

    if (error) {
        return (
            <div className="analytics-page">
                <div className="analytics-error">
                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>Unable to load analytics</h2>

                    <p>{error}</p>

                    <button
                        className="analytics-primary-button"
                        onClick={fetchAnalytics}
                    >
                        ↻ Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="analytics-header">

                <div className="analytics-header-content">

                    <div className="analytics-title-row">
                        <span className="analytics-title-icon">
                            📊
                        </span>

                        <div>
                            <h1>Analytics</h1>

                            <p>
                                Monitor your dairy farm performance
                                and health insights.
                            </p>
                        </div>
                    </div>

                    <button
                        className="analytics-primary-button"
                        onClick={fetchAnalytics}
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* =========================
                KPI CARDS
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-kpi-grid">

                    <div className="analytics-kpi-card">

                        <div className="analytics-kpi-icon">
                            🐄
                        </div>

                        <div className="analytics-kpi-content">
                            <span>Total Animals</span>

                            <strong>
                                {totalAnimals}
                            </strong>

                            <small>
                                Animals registered
                            </small>
                        </div>

                    </div>


                    <div className="analytics-kpi-card">

                        <div className="analytics-kpi-icon">
                            💚
                        </div>

                        <div className="analytics-kpi-content">
                            <span>Healthy Animals</span>

                            <strong>
                                {healthy}
                            </strong>

                            <small>
                                {healthPercentage}% of total animals
                            </small>
                        </div>

                    </div>


                    <div className="analytics-kpi-card">

                        <div className="analytics-kpi-icon">
                            🥛
                        </div>

                        <div className="analytics-kpi-content">
                            <span>Total Milk</span>

                            <strong>
                                {totalMilk}
                            </strong>

                            <small>
                                Milk production
                            </small>
                        </div>

                    </div>


                    <div className="analytics-kpi-card analytics-warning-card">

                        <div className="analytics-kpi-icon warning-icon">
                            ⚠️
                        </div>

                        <div className="analytics-kpi-content">
                            <span>Overdue Injections</span>

                            <strong>
                                {overdueInjections}
                            </strong>

                            <small>
                                Requires attention
                            </small>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                FARM MANAGEMENT
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            FARM ACTIVITY
                        </span>

                        <h2>
                            Farm Management Overview
                        </h2>

                        <p>
                            Current activity across your
                            major farm management modules.
                        </p>
                    </div>

                </div>


                <div className="farm-analytics-layout">

                    {/* CHART */}

                    <div className="analytics-card farm-chart-card">

                        <div className="analytics-card-header">

                            <div>
                                <h3>
                                    Farm Activity
                                </h3>

                                <span>
                                    Current records and resources
                                </span>
                            </div>

                            <div className="chart-badge">
                                Overview
                            </div>

                        </div>


                        <div className="farm-chart-wrapper">

                            <ResponsiveContainer
                                width="100%"
                                height={330}
                            >
                                <BarChart
                                    data={farmOverviewData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#E3EEE8"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill: "#667B72",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fill: "#667B72",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{
                                            fill: "#F0F7F3",
                                        }}
                                        contentStyle={{
                                            background:
                                                "#FFFFFF",
                                            border:
                                                "1px solid #D7E7DF",
                                            borderRadius:
                                                "12px",
                                            boxShadow:
                                                "0 8px 24px rgba(15,81,50,0.10)",
                                        }}
                                        labelStyle={{
                                            color: "#0F5132",
                                            fontWeight: 700,
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        fill="#16794F"
                                        radius={[
                                            7,
                                            7,
                                            0,
                                            0,
                                        ]}
                                        barSize={34}
                                    />

                                </BarChart>
                            </ResponsiveContainer>

                        </div>

                    </div>


                    {/* FARM SNAPSHOT */}

                    <div className="analytics-card farm-snapshot-card">

                        <div className="analytics-card-header">

                            <div>
                                <h3>
                                    Farm Snapshot
                                </h3>

                                <span>
                                    Quick overview
                                </span>
                            </div>

                        </div>


                        <div className="snapshot-list">

                            <div className="snapshot-item">
                                <span>🌾</span>

                                <div>
                                    <small>
                                        Total Farms
                                    </small>

                                    <strong>
                                        {totalFarms}
                                    </strong>
                                </div>
                            </div>


                            <div className="snapshot-item">
                                <span>🐄</span>

                                <div>
                                    <small>
                                        Animals
                                    </small>

                                    <strong>
                                        {totalAnimals}
                                    </strong>
                                </div>
                            </div>


                            <div className="snapshot-item">
                                <span>🥗</span>

                                <div>
                                    <small>
                                        Diet Plans
                                    </small>

                                    <strong>
                                        {totalDietPlans}
                                    </strong>
                                </div>
                            </div>


                            <div className="snapshot-item">
                                <span>🩺</span>

                                <div>
                                    <small>
                                        Health Records
                                    </small>

                                    <strong>
                                        {totalHealthRecords}
                                    </strong>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                HEALTH ANALYTICS
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            ANIMAL HEALTH
                        </span>

                        <h2>
                            Health Distribution
                        </h2>

                        <p>
                            Understand the current health
                            condition of your animals.
                        </p>
                    </div>

                </div>


                <div className="health-analytics-layout">

                    {/* DONUT */}

                    <div className="analytics-card health-donut-card">

                        <div className="analytics-card-header">

                            <div>
                                <h3>
                                    Health Distribution
                                </h3>

                                <span>
                                    Animal health status
                                </span>
                            </div>

                        </div>


                        <div className="health-donut-wrapper">

                            {totalAnimals > 0 ? (
                                <>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >
                                        <PieChart>

                                            <Pie
                                                data={
                                                    healthChartData
                                                }
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={78}
                                                outerRadius={108}
                                                paddingAngle={4}
                                                stroke="#FFFFFF"
                                                strokeWidth={4}
                                            >
                                                {healthChartData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={`health-${index}`}
                                                            fill={
                                                                entry.color
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip
                                                contentStyle={{
                                                    background:
                                                        "#FFFFFF",
                                                    border:
                                                        "1px solid #D7E7DF",
                                                    borderRadius:
                                                        "12px",
                                                }}
                                            />

                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="donut-center">

                                        <strong>
                                            {totalAnimals}
                                        </strong>

                                        <span>
                                            Animals
                                        </span>

                                    </div>
                                </>
                            ) : (
                                <div className="empty-chart">
                                    <span>🐄</span>

                                    <p>
                                        No animal health
                                        data available
                                    </p>
                                </div>
                            )}

                        </div>


                        <div className="health-legend">

                            <div>
                                <span className="legend-dot healthy-dot"></span>

                                <span>
                                    Healthy
                                </span>

                                <strong>
                                    {healthy}
                                </strong>
                            </div>


                            <div>
                                <span className="legend-dot attention-dot"></span>

                                <span>
                                    Attention
                                </span>

                                <strong>
                                    {attention}
                                </strong>
                            </div>


                            <div>
                                <span className="legend-dot critical-dot"></span>

                                <span>
                                    Critical
                                </span>

                                <strong>
                                    {critical}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* HEALTH STATUS */}

                    <div className="analytics-card health-status-card">

                        <div className="analytics-card-header">

                            <div>
                                <h3>
                                    Health Status
                                </h3>

                                <span>
                                    Current animal condition
                                </span>
                            </div>

                        </div>


                        <div className="health-status-list">

                            <div className="health-status-item healthy-status">

                                <div className="status-icon">
                                    ✓
                                </div>

                                <div className="status-details">

                                    <div className="status-title">
                                        <span>
                                            Healthy
                                        </span>

                                        <strong>
                                            {healthy}
                                        </strong>
                                    </div>

                                    <div className="status-progress">
                                        <div
                                            style={{
                                                width: `${healthPercentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {healthPercentage}% of animals
                                    </small>

                                </div>

                            </div>


                            <div className="health-status-item attention-status">

                                <div className="status-icon">
                                    !
                                </div>

                                <div className="status-details">

                                    <div className="status-title">
                                        <span>
                                            Attention
                                        </span>

                                        <strong>
                                            {attention}
                                        </strong>
                                    </div>

                                    <div className="status-progress">
                                        <div
                                            style={{
                                                width: `${attentionPercentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {attentionPercentage}% of animals
                                    </small>

                                </div>

                            </div>


                            <div className="health-status-item critical-status">

                                <div className="status-icon">
                                    !
                                </div>

                                <div className="status-details">

                                    <div className="status-title">
                                        <span>
                                            Critical
                                        </span>

                                        <strong>
                                            {critical}
                                        </strong>
                                    </div>

                                    <div className="status-progress">
                                        <div
                                            style={{
                                                width: `${criticalPercentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {criticalPercentage}% of animals
                                    </small>

                                </div>

                            </div>


                            <div className="health-status-item pregnant-status">

                                <div className="status-icon">
                                    ♡
                                </div>

                                <div className="status-details">

                                    <div className="status-title">
                                        <span>
                                            Pregnant
                                        </span>

                                        <strong>
                                            {pregnant}
                                        </strong>
                                    </div>

                                    <div className="status-progress">
                                        <div
                                            style={{
                                                width: `${pregnantPercentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {pregnantPercentage}% of animals
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                MILK PRODUCTION
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            FARM PRODUCTION
                        </span>

                        <h2>
                            Milk Production
                        </h2>

                        <p>
                            Monitor milk production performance
                            across your farm.
                        </p>
                    </div>

                </div>


                <div className="milk-analytics-grid">

                    <div className="analytics-card milk-card">

                        <div className="milk-icon">
                            🥛
                        </div>

                        <div className="milk-content">

                            <span>
                                Total Production
                            </span>

                            <strong>
                                {totalMilk}
                            </strong>

                            <small>
                                Total recorded milk
                            </small>

                        </div>

                    </div>


                    <div className="analytics-card milk-card">

                        <div className="milk-icon">
                            📈
                        </div>

                        <div className="milk-content">

                            <span>
                                Average Production
                            </span>

                            <strong>
                                {averageMilk}
                            </strong>

                            <small>
                                Average per animal
                            </small>

                        </div>

                    </div>


                    <div className="analytics-card milk-card">

                        <div className="milk-icon">
                            🏆
                        </div>

                        <div className="milk-content">

                            <span>
                                Top Producer
                            </span>

                            <strong className="producer-name">
                                {topProducerName}
                            </strong>

                            <small>
                                {topProducerMilk
                                    ? `${topProducerMilk} milk production`
                                    : "Highest production animal"}
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                INJECTION MONITORING
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            HEALTHCARE MANAGEMENT
                        </span>

                        <h2>
                            Injection Monitoring
                        </h2>

                        <p>
                            Track vaccination and injection
                            activity across your animals.
                        </p>
                    </div>

                </div>


                <div className="injection-analytics-grid">

                    <div className="analytics-card injection-card">

                        <div className="injection-icon">
                            💉
                        </div>

                        <div>
                            <span>
                                Total Injections
                            </span>

                            <strong>
                                {totalInjections}
                            </strong>
                        </div>

                    </div>


                    <div className="analytics-card injection-card upcoming-injection">

                        <div className="injection-icon">
                            📅
                        </div>

                        <div>
                            <span>
                                Upcoming
                            </span>

                            <strong>
                                {upcomingInjections}
                            </strong>
                        </div>

                    </div>


                    <div className="analytics-card injection-card overdue-injection">

                        <div className="injection-icon">
                            ⚠️
                        </div>

                        <div>
                            <span>
                                Overdue
                            </span>

                            <strong>
                                {overdueInjections}
                            </strong>
                        </div>

                    </div>

                </div>


                <div className="analytics-card progress-card">

                    <div className="progress-card-header">

                        <div>
                            <h3>
                                Injection Compliance
                            </h3>

                            <span>
                                Injections currently not overdue
                            </span>
                        </div>

                        <strong>
                            {injectionProgress}%
                        </strong>

                    </div>

                    <div className="main-progress">
                        <div
                            style={{
                                width: `${injectionProgress}%`,
                            }}
                        ></div>
                    </div>

                </div>

            </section>


            {/* =========================
                REMINDER PERFORMANCE
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            FARM REMINDERS
                        </span>

                        <h2>
                            Reminder Performance
                        </h2>

                        <p>
                            Track how efficiently farm reminders
                            are being completed.
                        </p>
                    </div>

                </div>


                <div className="reminder-performance-card analytics-card">

                    <div className="reminder-summary">

                        <div className="reminder-main-icon">
                            🔔
                        </div>

                        <div>
                            <span>
                                Completed Reminders
                            </span>

                            <strong>
                                {completedReminders}
                            </strong>

                            <small>
                                out of {totalReminders} total reminders
                            </small>
                        </div>

                    </div>


                    <div className="reminder-progress-section">

                        <div className="reminder-progress-header">
                            <span>
                                Completion rate
                            </span>

                            <strong>
                                {reminderProgress}%
                            </strong>
                        </div>

                        <div className="main-progress">
                            <div
                                style={{
                                    width: `${reminderProgress}%`,
                                }}
                            ></div>
                        </div>

                        <div className="reminder-meta">
                            <span>
                                Pending: {pendingReminders}
                            </span>

                            <span>
                                Completed: {completedReminders}
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                FARM INSIGHTS
            ========================= */}

            <section className="analytics-section">

                <div className="analytics-section-heading">

                    <div>
                        <span className="section-kicker">
                            FARM INSIGHTS
                        </span>

                        <h2>
                            Key Insights
                        </h2>

                        <p>
                            Important observations from your
                            current farm data.
                        </p>
                    </div>

                </div>


                <div className="insights-grid">

                    <div className="analytics-card insight-card">

                        <div className="insight-icon green-insight">
                            💚
                        </div>

                        <div>
                            <h3>
                                Animal Health
                            </h3>

                            <p>
                                {healthy > 0
                                    ? `${healthPercentage}% of your animals are currently healthy.`
                                    : "No healthy animal data available yet."}
                            </p>
                        </div>

                    </div>


                    <div className="analytics-card insight-card">

                        <div className="insight-icon amber-insight">
                            💉
                        </div>

                        <div>
                            <h3>
                                Injection Status
                            </h3>

                            <p>
                                {overdueInjections > 0
                                    ? `${overdueInjections} injection${overdueInjections > 1 ? "s are" : " is"} overdue and require attention.`
                                    : "All recorded injections are currently on schedule."}
                            </p>
                        </div>

                    </div>


                    <div className="analytics-card insight-card">

                        <div className="insight-icon green-insight">
                            🥛
                        </div>

                        <div>
                            <h3>
                                Milk Production
                            </h3>

                            <p>
                                Current recorded production is{" "}
                                <strong>
                                    {totalMilk}
                                </strong>
                                .
                            </p>
                        </div>

                    </div>


                    <div className="analytics-card insight-card">

                        <div className="insight-icon green-insight">
                            🐄
                        </div>

                        <div>
                            <h3>
                                Pregnancy Tracking
                            </h3>

                            <p>
                                {pregnant} animal
                                {pregnant !== 1 ? "s" : ""} currently
                                marked as pregnant.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                BACK TO DASHBOARD
            ========================= */}

            <div className="analytics-footer">

                <button
                    className="back-dashboard-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to Dashboard
                </button>

            </div>

        </div>
    );
}

export default Analytics;