import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  ScanSearch,
  Trash2,
  ArrowUpRight,
  Users,
  FileStack,
  TrendingUp,
  Clock,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <div
      className="animate-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        animationDelay: delay,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          <Icon size={26} />
        </div>
        {sub && (
          <span
            style={{
              fontSize: 11,
              color: "var(--green)",
              background: "var(--green-bg)",
              padding: "2px 8px",
              borderRadius: 99,
              border: "1px solid var(--green-border)",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-3)",
          marginTop: 5,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ScorePill({ score }) {
  const color =
    score >= 70
      ? "var(--green)"
      : score >= 50
        ? "var(--gold)"
        : "var(--text-3)";
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 16,
        color,
        minWidth: 44,
        display: "inline-block",
      }}
    >
      {Math.round(score)}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/screen/sessions")
      .then((r) => setSessions(r.data))
      .finally(() => setLoading(false));
  }, []);

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this screening session and all its data?")) return;
    await axios.delete(`/api/screen/sessions/${id}`);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  const totalCandidates = sessions.reduce((a, s) => a + s.candidate_count, 0);
  const avgScore = sessions.length
    ? Math.round(
        sessions.reduce((a, s) => a + s.top_score, 0) / sessions.length,
      )
    : 0;

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1800, margin: "0 auto",minWidth:'1200px' }}>
      {/* Page header */}
      <div
        className="animate-up"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            ,{" "}
            <em style={{ color: "var(--gold)" }}>
              {user?.name?.split(" ")[0]}
            </em>
          </h1>
        </div>
        <button
          onClick={() => navigate("/screen")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background:
              "linear-gradient(135deg, var(--gold), var(--gold-light))",
            color: "#0e0e0f",
            border: "none",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: "0 2px 16px rgba(201,169,110,0.25)",
            transition: "opacity 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <ScanSearch size={15} /> New screening
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: "2rem",
        }}
      >
        <StatCard
          icon={FileStack}
          label="Total sessions"
          value={sessions.length}
          color="var(--blue)"
          delay="0.06s"
          
        />
        <StatCard
          icon={Users}
          label="Candidates screened"
          value={totalCandidates}
          color="var(--green)"
          delay="0.12s"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg top score"
          value={`${avgScore}`}
          sub={avgScore > 0 ? "/100" : undefined}
          color="var(--gold)"
          delay="0.18s"
        />
      </div>

      {/* Sessions table */}
      <div
        className="animate-up"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          animationDelay: "0.22s",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{ fontWeight: 500, fontSize: 15, color: "var(--text)" }}
            >
              Screening history
            </span>
            <span
              style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 10 }}
            >
              {sessions.length} sessions
            </span>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--text-3)",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: "2px solid var(--border-2)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: "var(--text-3)",
                marginBottom: 8,
              }}
            >
              No screenings yet
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                marginBottom: "1.5rem",
              }}
            >
              Upload your first batch of resumes to get started
            </p>
            <button
              onClick={() => navigate("/screen")}
              style={{
                padding: "10px 20px",
                background: "var(--gold-dim)",
                border: "1px solid rgba(201,169,110,0.3)",
                borderRadius: "var(--radius)",
                color: "var(--gold)",
                fontWeight: 500,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Start screening
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 140px 120px 100px 80px 72px",
                padding: "8px 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["Session", "Date", "Candidates", "Top score", "By", ""].map(
                (h) => (
                  <div
                    key={h}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h}
                  </div>
                ),
              )}
            </div>
            <div className="stagger">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/sessions/${s.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 140px 120px 100px 80px 72px",
                    columnGap: "18px",
                    padding: "14px 1.5rem",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{paddingRight:10}}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: "var(--text)",
                      }}
                    >
                      {s.title}
                    </div>
                  </div>
                  <div style={{paddingRight:10}}>
                    <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-3)",
                    }}
                  >
                    <Clock size={11} />
                    {new Date(s.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-2)",
                        background: "var(--bg-3)",
                        border: "1px solid var(--border-2)",
                        padding: "3px 10px",
                        borderRadius: 99,
                      }}
                    >
                      {s.candidate_count} candidates
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <ScorePill score={s.top_score} />
                    <div style={{ display: "flex", gap: 4 }}>
                      {s.shortlisted > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--green)",
                            background: "var(--green-bg)",
                            padding: "1px 6px",
                            borderRadius: 99,
                            border: "1px solid var(--green-border)",
                          }}
                        >
                          {s.shortlisted} ✓
                        </span>
                      )}
                      {s.duplicate_count > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--amber)",
                            background: "var(--amber-bg)",
                            padding: "1px 6px",
                            borderRadius: 99,
                            border: "1px solid var(--amber-border)",
                          }}
                        >
                          {s.duplicate_count} dup
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 5, alignItems: "center" }}
                  >
                    {s.shortlisted > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--green)",
                          background: "var(--green-bg)",
                          padding: "1px 7px",
                          borderRadius: 99,
                          border: "1px solid var(--green-border)",
                        }}
                      >
                        {s.shortlisted} shortlisted
                      </span>
                    )}
                    {s.duplicate_count > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--amber)",
                          background: "var(--amber-bg)",
                          padding: "1px 7px",
                          borderRadius: 99,
                          border: "1px solid var(--amber-border)",
                        }}
                      >
                        {s.duplicate_count} dup
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {s.user_name?.split(" ")[0]}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sessions/${s.id}`);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid var(--border-2)",
                        borderRadius: "var(--radius)",
                        background: "var(--surface-2)",
                        cursor: "pointer",
                        color: "var(--text-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--gold)";
                        e.currentTarget.style.color = "var(--gold)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-2)";
                        e.currentTarget.style.color = "var(--text-2)";
                      }}
                    >
                      <ArrowUpRight size={13} />
                    </button>
                    <button
                      onClick={(e) => deleteSession(s.id, e)}
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid var(--border-2)",
                        borderRadius: "var(--radius)",
                        background: "var(--surface-2)",
                        cursor: "pointer",
                        color: "var(--text-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--red-border)";
                        e.currentTarget.style.color = "var(--red)";
                        e.currentTarget.style.background = "var(--red-bg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-2)";
                        e.currentTarget.style.color = "var(--text-3)";
                        e.currentTarget.style.background = "var(--surface-2)";
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
