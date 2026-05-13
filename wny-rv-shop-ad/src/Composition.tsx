import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const colors = {
  ink: "#061412",
  deep: "#10231f",
  green: "#47d17b",
  mint: "#a7f3d0",
  cyan: "#5fe4ff",
  amber: "#ffbd59",
  red: "#ff6b6b",
  cream: "#fff8e8",
  white: "#ffffff",
};

const scenes = {
  hook: { from: 0, duration: 150 },
  flow: { from: 132, duration: 174 },
  dashboard: { from: 288, duration: 207 },
  features: { from: 474, duration: 201 },
  local: { from: 657, duration: 153 },
  cta: { from: 792, duration: 108 },
};

const second = (value: number, fps: number) => Math.round(value * fps);

const bezier = Easing.bezier(0.16, 1, 0.3, 1);
const smooth = Easing.bezier(0.45, 0, 0.55, 1);

const clampInterpolate = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = bezier,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const sceneFade = (
  frame: number,
  duration: number,
  fps: number,
  fadeSeconds = 0.45,
) => {
  const fadeFrames = second(fadeSeconds, fps);
  const inOpacity = clampInterpolate(frame, [0, fadeFrames], [0, 1]);
  const outOpacity = clampInterpolate(
    frame,
    [duration - fadeFrames, duration],
    [1, 0],
    Easing.in(Easing.cubic),
  );
  return Math.min(inOpacity, outOpacity);
};

const enter = (
  frame: number,
  delay: number,
  fps: number,
  durationSeconds = 0.75,
) =>
  clampInterpolate(
    frame,
    [second(delay, fps), second(delay + durationSeconds, fps)],
    [0, 1],
  );

export const WnyRvShopAd = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="video">
      <AmbientBackdrop />
      <Audio
        src={staticFile("audio/automation-pulse.wav")}
        volume={(frame) =>
          interpolate(
            frame,
            [0, second(1.4, fps), second(28.5, fps), second(30, fps)],
            [0, 0.72, 0.72, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <Sequence from={scenes.hook.from} durationInFrames={scenes.hook.duration}>
        <HookScene duration={scenes.hook.duration} />
      </Sequence>
      <Sequence from={scenes.flow.from} durationInFrames={scenes.flow.duration}>
        <WorkflowScene duration={scenes.flow.duration} />
      </Sequence>
      <Sequence
        from={scenes.dashboard.from}
        durationInFrames={scenes.dashboard.duration}
      >
        <DashboardScene duration={scenes.dashboard.duration} />
      </Sequence>
      <Sequence
        from={scenes.features.from}
        durationInFrames={scenes.features.duration}
      >
        <FeaturesScene duration={scenes.features.duration} />
      </Sequence>
      <Sequence
        from={scenes.local.from}
        durationInFrames={scenes.local.duration}
      >
        <LocalScene duration={scenes.local.duration} />
      </Sequence>
      <Sequence from={scenes.cta.from} durationInFrames={scenes.cta.duration}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};

const AmbientBackdrop = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 23) * 0.5 + 0.5;
  const drift = interpolate(Math.sin(frame / 95), [-1, 1], [-18, 18]);

  return (
    <AbsoluteFill>
      <div className="base-gradient" />
      <div
        className="grid-layer"
        style={{
          opacity: 0.16 + pulse * 0.08,
          transform: `translate3d(${drift}px, ${drift * -0.6}px, 0)`,
        }}
      />
      <div className="scanline" style={{ opacity: 0.05 + pulse * 0.04 }} />
    </AbsoluteFill>
  );
};

const HookScene = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, duration, fps);
  const title = enter(frame, 0.2, fps);
  const subtitle = enter(frame, 1.15, fps);
  const pills = enter(frame, 2.2, fps);

  return (
    <AbsoluteFill style={{ opacity }}>
      <PhotoBackdrop
        src="assets/rv-service-bay.jpg"
        zoomFrom={1.02}
        zoomTo={1.14}
        panX={-38}
      />
      <div className="photo-vignette" />
      <BrandBug />
      <div className="hero-copy">
        <div
          className="eyebrow"
          style={{
            opacity: title,
            transform: `translateY(${interpolate(title, [0, 1], [34, 0])}px)`,
          }}
        >
          Built for busy WNY service businesses
        </div>
        <h1
          style={{
            opacity: title,
            transform: `translateY(${interpolate(title, [0, 1], [44, 0])}px)`,
          }}
        >
          Your RV shop should not lose leads while the bays are full.
        </h1>
        <p
          style={{
            opacity: subtitle,
            transform: `translateY(${interpolate(subtitle, [0, 1], [32, 0])}px)`,
          }}
        >
          WNY Automation turns missed calls, web forms, and quote follow-ups
          into clear next steps.
        </p>
      </div>
      <div
        className="problem-stack"
        style={{
          opacity: pills,
          transform: `translateX(${interpolate(pills, [0, 1], [70, 0])}px)`,
        }}
      >
        <SignalCard label="Missed call" value="7:42 PM" tone="red" />
        <SignalCard label="Quote follow-up" value="3 days cold" tone="amber" />
        <SignalCard label="Website lead" value="Needs service" tone="cyan" />
      </div>
    </AbsoluteFill>
  );
};

const WorkflowScene = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, duration, fps);
  const left = enter(frame, 0.1, fps);
  const flow = enter(frame, 1.4, fps);
  const caption = enter(frame, 4.1, fps);
  const nodes = [
    { label: "Lead arrives", detail: "Form, call, email", color: colors.cyan },
    { label: "AI summary", detail: "Issue + urgency", color: colors.green },
    { label: "Staff alert", detail: "Owner gets context", color: colors.amber },
    {
      label: "Follow-up task",
      detail: "Due before it goes cold",
      color: colors.mint,
    },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <PhotoBackdrop
        src="assets/niagara-night.jpg"
        zoomFrom={1.08}
        zoomTo={1.18}
        panX={24}
      />
      <div className="deep-overlay" />
      <div
        className="workflow-headline"
        style={{
          opacity: left,
          transform: `translateY(${interpolate(left, [0, 1], [36, 0])}px)`,
        }}
      >
        <span>One workflow.</span>
        <strong>Every inquiry organized.</strong>
      </div>
      <div className="flow-rail" style={{ opacity: flow }}>
        {nodes.map((node, index) => (
          <FlowNode
            key={node.label}
            {...node}
            index={index}
            progress={flow}
            active={clampInterpolate(
              frame,
              [
                second(1.4 + index * 0.45, fps),
                second(2.15 + index * 0.45, fps),
              ],
              [0, 1],
            )}
          />
        ))}
      </div>
      <div
        className="conversion-panel"
        style={{
          opacity: caption,
          transform: `translateY(${interpolate(caption, [0, 1], [46, 0])}px)`,
        }}
      >
        <div className="metric">
          <strong>Before</strong>
          <span>Inbox checking, sticky notes, memory.</span>
        </div>
        <div className="arrow-pulse">→</div>
        <div className="metric highlighted">
          <strong>After</strong>
          <span>Lead captured, summarized, assigned, followed up.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DashboardScene = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, duration, fps);
  const shell = enter(frame, 0.15, fps);
  const browser = enter(frame, 0.9, fps);
  const dashboard = enter(frame, 1.6, fps);
  const signal = enter(frame, 3.15, fps);
  const orb = Math.sin(frame / 14) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{ opacity }}>
      <div className="solid-stage" />
      <div
        className="screen-title"
        style={{
          opacity: shell,
          transform: `translateY(${interpolate(shell, [0, 1], [28, 0])}px)`,
        }}
      >
        <span>Example build</span>
        <strong>Western New York RV Shop Lead Rescue</strong>
      </div>
      <div className="screens-wrap">
        <div
          className="browser-window"
          style={{
            opacity: browser,
            transform: `perspective(1400px) rotateY(-7deg) translateX(${interpolate(browser, [0, 1], [-80, 0])}px)`,
          }}
        >
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <em>westernnyrvshop.com/service</em>
          </div>
          <div className="site-hero">
            <Img
              src={staticFile("assets/rv-campsite.jpg")}
              className="site-photo"
            />
            <div className="site-overlay" />
            <div className="site-copy">
              <b>Western New York RV Shop</b>
              <h2>Book service before the next trip.</h2>
              <p>Winterization, inspections, repairs, and parts requests.</p>
              <button>Request service</button>
            </div>
          </div>
          <div className="mini-form">
            <div>
              <label>Customer question</label>
              <p>“Can you inspect my Class C before Memorial Day weekend?”</p>
            </div>
            <span>Submit</span>
          </div>
        </div>
        <div
          className="dashboard-window"
          style={{
            opacity: dashboard,
            transform: `perspective(1400px) rotateY(5deg) translateX(${interpolate(dashboard, [0, 1], [88, 0])}px)`,
          }}
        >
          <div className="dashboard-top">
            <div>
              <small>WNY Automation Co</small>
              <h3>Lead Rescue Dashboard</h3>
            </div>
            <span
              style={{ boxShadow: `0 0 ${18 + orb * 24}px ${colors.green}` }}
            >
              Live
            </span>
          </div>
          <DashboardRow
            icon="01"
            title="New RV service inquiry"
            detail="Class C inspection request • after-hours"
            tone={colors.cyan}
            delay={2.1}
          />
          <DashboardRow
            icon="02"
            title="AI summary created"
            detail="Needs pre-trip inspection, likely May deadline"
            tone={colors.green}
            delay={2.65}
          />
          <DashboardRow
            icon="03"
            title="Auto reply drafted"
            detail="Friendly first response with next-step questions"
            tone={colors.amber}
            delay={3.2}
          />
          <DashboardRow
            icon="04"
            title="Owner task assigned"
            detail="Call before 9:00 AM • quote follow-up scheduled"
            tone={colors.mint}
            delay={3.75}
          />
          <div className="dashboard-chart" style={{ opacity: signal }}>
            {[0.38, 0.72, 0.54, 0.91, 0.68, 0.83, 0.97].map((height, index) => (
              <span
                key={index}
                style={{
                  height: `${height * 100}%`,
                  transform: `scaleY(${clampInterpolate(frame, [second(3.2 + index * 0.08, fps), second(3.75 + index * 0.08, fps)], [0, 1])})`,
                }}
              />
            ))}
            <p>Response windows protected</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeaturesScene = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, duration, fps);
  const title = enter(frame, 0.15, fps);
  const network = enter(frame, 0.8, fps);
  const features = [
    ["Missed lead rescue", "First response alerts"],
    ["Quote follow-up", "No estimate forgotten"],
    ["Intake to task", "Owners, due dates, context"],
    ["FAQ lead capture", "Website questions become leads"],
    ["Appointment reminders", "Fewer manual check-ins"],
    ["Blog schedules", "Local SEO stays moving"],
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <PhotoBackdrop
        src="assets/dealership-service.jpg"
        zoomFrom={1.05}
        zoomTo={1.13}
        panX={34}
      />
      <div className="feature-stage" />
      <div className="feature-photo-overlay" />
      <div
        className="feature-heading"
        style={{
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
        }}
      >
        <span>Practical automations</span>
        <h2>Not a giant software project. One repeatable win at a time.</h2>
      </div>
      <div className="feature-network" style={{ opacity: network }}>
        <NodeMap frame={frame} fps={fps} />
        <div className="feature-grid">
          {features.map(([name, detail], index) => {
            const card = enter(frame, 1.2 + index * 0.18, fps);
            return (
              <div
                className="feature-card"
                key={name}
                style={{
                  opacity: card,
                  transform: `translateY(${interpolate(card, [0, 1], [34, 0])}px)`,
                  borderColor:
                    index % 3 === 0
                      ? "rgba(95,228,255,0.45)"
                      : index % 3 === 1
                        ? "rgba(255,189,89,0.48)"
                        : "rgba(71,209,123,0.48)",
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{name}</strong>
                <p>{detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LocalScene = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, duration, fps);
  const title = enter(frame, 0.2, fps);
  const cards = enter(frame, 1.4, fps);
  const sweep = interpolate(frame, [0, duration], [-16, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <PhotoBackdrop
        src="assets/niagara-bridge.jpg"
        zoomFrom={1.12}
        zoomTo={1.03}
        panX={sweep}
        panY={-50}
      />
      <div className="local-overlay" />
      <div
        className="local-copy"
        style={{
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [40, 0])}px)`,
        }}
      >
        <span>Local support, modern systems</span>
        <h2>
          Buffalo, Niagara, and Western New York businesses get automation that
          speaks plain English.
        </h2>
      </div>
      <div className="local-card-row" style={{ opacity: cards }}>
        <MiniMetric value="1" label="workflow first" />
        <MiniMetric value="3" label="practical ideas" />
        <MiniMetric value="0" label="tech jargon" />
      </div>
    </AbsoluteFill>
  );
};

const CtaScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = clampInterpolate(frame, [0, second(0.5, fps)], [0, 1]);
  const title = enter(frame, 0.25, fps);
  const callout = enter(frame, 1.2, fps);
  const ring = Math.sin(frame / 12) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{ opacity }}>
      <div className="cta-stage" />
      <div className="cta-logo" style={{ opacity: title }}>
        <Img src={staticFile("assets/wny-automation-logo.svg")} />
      </div>
      <div
        className="cta-card"
        style={{
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [44, 0])}px) scale(${interpolate(title, [0, 1], [0.96, 1])})`,
          boxShadow: `0 0 ${36 + ring * 34}px rgba(71, 209, 123, ${0.22 + ring * 0.1})`,
        }}
      >
        <p>Free workflow audit</p>
        <h2>Get 3 practical automation ideas for one manual workflow.</h2>
        <div className="cta-url">wnyautomation.com/free-workflow-audit</div>
      </div>
      <div className="cta-footer" style={{ opacity: callout }}>
        <span>Missed leads</span>
        <span>Quote follow-up</span>
        <span>Intake routing</span>
        <span>Website + blog systems</span>
      </div>
    </AbsoluteFill>
  );
};

const PhotoBackdrop = ({
  src,
  zoomFrom,
  zoomTo,
  panX = 0,
  panY = 0,
}: {
  src: string;
  zoomFrom: number;
  zoomTo: number;
  panX?: number;
  panY?: number;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Img
      src={staticFile(src)}
      className="photo-backdrop"
      style={{
        transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
      }}
    />
  );
};

const BrandBug = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = enter(frame, 0.1, fps, 0.55);

  return (
    <div className="brand-bug" style={{ opacity: show }}>
      <Img src={staticFile("assets/wny-automation-icon.png")} />
      <span>WNY Automation Co</span>
    </div>
  );
};

const SignalCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "amber" | "cyan";
}) => {
  const toneColor =
    tone === "red" ? colors.red : tone === "amber" ? colors.amber : colors.cyan;

  return (
    <div className="signal-card" style={{ borderColor: toneColor }}>
      <span style={{ backgroundColor: toneColor }} />
      <div>
        <b>{label}</b>
        <p>{value}</p>
      </div>
    </div>
  );
};

const FlowNode = ({
  label,
  detail,
  color,
  active,
  index,
}: {
  label: string;
  detail: string;
  color: string;
  active: number;
  progress: number;
  index: number;
}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 8 + index) * 0.5 + 0.5;
  const y = interpolate(active, [0, 1], [34, 0]);

  return (
    <div className="flow-node-wrap">
      {index > 0 ? (
        <div
          className="flow-line"
          style={{ transform: `scaleX(${active})`, backgroundColor: color }}
        />
      ) : null}
      <div
        className="flow-node"
        style={{
          opacity: active,
          transform: `translateY(${y}px) scale(${0.92 + active * 0.08})`,
          borderColor: color,
          boxShadow: `0 0 ${12 + pulse * 28}px ${color}55`,
        }}
      >
        <span style={{ color }}>{String(index + 1).padStart(2, "0")}</span>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
};

const DashboardRow = ({
  icon,
  title,
  detail,
  tone,
  delay,
}: {
  icon: string;
  title: string;
  detail: string;
  tone: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = enter(frame, delay, fps, 0.55);

  return (
    <div
      className="dashboard-row"
      style={{
        opacity: show,
        transform: `translateX(${interpolate(show, [0, 1], [42, 0])}px)`,
        borderColor: `${tone}66`,
      }}
    >
      <span style={{ backgroundColor: tone }}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
};

const NodeMap = ({ frame, fps }: { frame: number; fps: number }) => {
  const points = [
    [16, 42, colors.cyan],
    [32, 22, colors.green],
    [52, 44, colors.amber],
    [68, 24, colors.mint],
    [84, 44, colors.cyan],
  ] as const;

  return (
    <div className="node-map">
      {points.map(([x, y, color], index) => {
        const show = enter(frame, 0.65 + index * 0.16, fps);
        const pulse = Math.sin(frame / 10 + index) * 0.5 + 0.5;
        return (
          <div
            key={`${x}-${y}`}
            className="map-dot"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              opacity: show,
              backgroundColor: color,
              boxShadow: `0 0 ${20 + pulse * 28}px ${color}`,
              transform: `scale(${0.75 + show * 0.25 + pulse * 0.08})`,
            }}
          />
        );
      })}
      {points.slice(1).map(([x, y, color], index) => {
        const prev = points[index];
        const dx = x - prev[0];
        const dy = y - prev[1];
        const width = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const show = enter(frame, 1 + index * 0.2, fps);
        return (
          <div
            key={`line-${x}-${y}`}
            className="map-line"
            style={{
              left: `${prev[0]}%`,
              top: `${prev[1]}%`,
              width: `${width}%`,
              transform: `rotate(${angle}deg) scaleX(${show})`,
              backgroundColor: color,
              opacity: show * 0.78,
            }}
          />
        );
      })}
    </div>
  );
};

const MiniMetric = ({ value, label }: { value: string; label: string }) => (
  <div className="mini-metric">
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);
