"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  CalendarClock,
  Clock3,
  Car,
  CreditCard,
  Flower2,
  Globe,
  Languages,
  Leaf,
  MapPin,
  Plane,
  PlaneLanding,
  Plug,
  Shield,
  Snowflake,
  Timer,
  Wallet,
  ArrowRightLeft,
  Settings,
  Flame,
  Hospital,
  Syringe,
  Thermometer,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type TabId = "visa" | "essentials" | "attractions" | "months";

const RATE = 151.45;

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "visa", label: "Visa" },
  { id: "essentials", label: "Essentials" },
  { id: "attractions", label: "Attractions" },
  { id: "months", label: "Weather" },
];

export default function VisaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("visa");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeAttractionFilter, setActiveAttractionFilter] = useState("All");
  const tabNavRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    visa: null,
    essentials: null,
    attractions: null,
    months: null,
  });
  const essentialFilterRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [usd, setUsd] = useState("1");
  const [jpy, setJpy] = useState("151.45");

  const essentialFilters = ["All", "Power & Plug", "Apps", "Health", "Emergency"];
  const adapters = [
    { name: "Type A", spec: "100V, 50/60Hz" },
    { name: "Type B", spec: "100V, 50/60Hz" },
  ];
  const apps = [
    { name: "Japan Taxi", desc: "Local ride-hailing app", icon: Car },
    { name: "Japan Travel", desc: "Official tourism app", icon: Globe },
    { name: "Translate", desc: "Japanese translator", icon: Languages },
  ];
  const emergencyContacts = [
    { name: "Ambulance", number: "119", icon: Hospital },
    { name: "Police", number: "110", icon: Shield },
    { name: "Fire", number: "119", icon: Flame },
    { name: "Tourist Helpline", number: "050-3816-2787", icon: Hospital },
  ];
  const attractionCards = [
    {
      title: "Senso-ji Temple",
      price: "¥500",
      description:
        "Tokyo's oldest Buddhist temple, featuring iconic red lanterns and traditional architecture.",
      time: "6:00 - 17:00",
      image: "/Senji.jpg",
    },
    {
      title: "Tokyo Skytree",
      price: "¥2,000",
      description:
        "The world's tallest tower offering panoramic views of Tokyo from its observation decks.",
      time: "10:00 - 21:00",
      image: "/Skyline.jpg",
    },
  ];
  const attractionFilters = ["All", "Temples", "Museums", "Parks"];
  const weatherLegend = [
    { label: "Peak Season", color: "#f2c94c" },
    { label: "Shoulder", color: "#7a3d71" },
    { label: "Off-Season", color: "#355091" },
  ];
  const monthStrip = [
    { month: "Jan", season: "off" },
    { month: "Feb", season: "off" },
    { month: "Mar", season: "shoulder" },
    { month: "Apr", season: "peak" },
    { month: "May", season: "peak" },
    { month: "Jun", season: "off" },
    { month: "Jul", season: "off" },
    { month: "Aug", season: "shoulder" },
    { month: "Sep", season: "shoulder" },
    { month: "Oct", season: "peak" },
    { month: "Nov", season: "peak" },
    { month: "Dec", season: "off" },
  ] as const;
  const weatherCards = [
    {
      title: "Spring (Mar-May)",
      season: "Peak",
      seasonColor: "#f2c94c",
      weather: "Mild temperatures (10-20°C)",
      subtitle: "Perfect for outdoor activities and cherry blossom viewing",
      events: [
        "Cherry Blossom Festival (March-April)",
        "Spring Sumo Tournament (May)",
        "Tea Ceremony Festival (April)",
      ],
    },
    {
      title: "Summer (Jun-Aug)",
      season: "Shoulder",
      seasonColor: "#7a3d71",
      weather: "Hot & Humid (25-35°C)",
      subtitle: "Frequent rainfall, high humidity levels",
      events: ["Gion Festival (July)", "Tanabata Festival (July)", "Obon Festival (August)"],
    },
    {
      title: "Autumn (Sep-Nov)",
      season: "Shoulder",
      seasonColor: "#7a3d71",
      weather: "Cool & Pleasant (15-25°C)",
      subtitle: "Clear skies, comfortable temperatures",
      events: ["Autumn Foliage Viewing", "Fall Sumo Tournament", "Sake Festival"],
    },
    {
      title: "Winter (Dec-Feb)",
      season: "Off-Season",
      seasonColor: "#355091",
      weather: "Cold (0-10°C)",
      subtitle: "Snow in northern regions, dry climate",
      events: ["Sapporo Snow Festival (February)", "New Year Celebrations", "Winter Illuminations"],
    },
  ];

  const onUsdChange = (value: string) => {
    setUsd(value);
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      setJpy("0.00");
      return;
    }
    setJpy((parsed * RATE).toFixed(2));
  };

  const onJpyChange = (value: string) => {
    setJpy(value);
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      setUsd("0.0000");
      return;
    }
    setUsd((parsed / RATE).toFixed(4));
  };

  const syncFromJpy = () => {
    const parsed = Number.parseFloat(jpy);
    if (Number.isNaN(parsed)) {
      setUsd("0.0000");
      return;
    }
    setUsd((parsed / RATE).toFixed(4));
  };

  return (
    <main className="flex min-h-screen justify-center overflow-auto bg-[#1e1f29]">
      <div
        className="relative min-h-screen w-full max-w-[390px] bg-[#1e1f29] text-[#e8e8f0]"
        style={{ zoom: 1.6 }}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between bg-[#1e1f29] px-5 pb-3 pt-[18px]">
          <button type="button" onClick={() => router.push("/select-country")} className="text-[#e8e8f0]">
              <ArrowLeft className="h-5 w-5 text-black" />
          </button>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="inline-flex h-[18px] w-[26px] items-center justify-center rounded-[2px] bg-white">
              <span className="h-[10px] w-[10px] rounded-full bg-[#bc002d]" />
            </span>
            <span>Japan</span>
          </div>
          <button type="button" className="text-[#e8e8f0]">
            <Languages className="h-[22px] w-[22px] text-white" />
          </button>
        </header>

        <section className="mx-4 mb-4 rounded-2xl border border-[#2d454a] bg-[#23242e] p-4">
          <div className="mb-[14px] flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[rgba(72,187,120,0.18)] px-3 py-1 text-[13px] font-medium text-[#48bb78]">
              <Globe className="h-[13px] w-[13px] text-black" />
              Visa-Free
            </span>
            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[rgba(237,137,54,0.18)] px-3 py-1 text-[13px] font-medium text-[#ed8936]">
              <Timer className="h-[13px] w-[13px] text-black" />
              90 Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
            <div>
              <p className="mb-1 text-[11px] text-[#8888aa]">Best Time to Visit</p>
              <div className="flex flex-wrap items-center gap-1 text-[13px] font-medium">
                <Flower2 className="h-3.5 w-3.5 text-pink-400" />
                <span>Apr</span>
                <span className="px-1 text-[#8888aa]">|</span>
                <Leaf className="h-3.5 w-3.5 text-red-500" />
                <span>Oct</span>
                <span className="px-1 text-[#8888aa]">|</span>
                <Snowflake className="h-3.5 w-3.5 text-cyan-300" />
                <span>Feb</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-[#8888aa]">Currency</p>
              <p className="text-[13px] font-medium">Japanese Yen (Y)</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-[#8888aa]">Plug Type</p>
              <p className="text-[13px] font-medium">Type A / Type B</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-[#8888aa]">Time Zone</p>
              <p className="text-[13px] font-medium">UTC+9 (JST)</p>
            </div>
          </div>
        </section>

        <nav
          ref={tabNavRef}
          className="mx-4 flex overflow-x-auto border-b border-[#2e2e4a] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "visa") {
                  tabNavRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  return;
                }
                tabRefs.current[tab.id]?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "start",
                });
              }}
                className={`-mb-px border-b-2 px-4 py-3 text-center text-[12px] font-normal whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#4fd1c5] text-[#4fd1c5]"
                  : "border-transparent text-[#8888aa]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="px-4 py-5">
          {activeTab === "visa" ? (
            <>
              <h2 className="mb-[14px] mt-2 text-[17px] font-semibold text-[#c8c8e0]">Required Documents</h2>
              <ul className="mb-6 space-y-[10px]">
                <ListRow icon={Wallet} text="Valid passport (6+ months)" />
                <ListRow icon={Plane} text="Return ticket" />
                <ListRow icon={CreditCard} text="Proof of sufficient funds" />
              </ul>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Entry Requirements</h2>
              <ul className="mb-6 space-y-[10px]">
                <ListRow icon={Timer} text="Stay up to 90 days" />
                <ListRow icon={PlaneLanding} text="Arrival via any international airport" />
                <ListRow icon={CalendarClock} text="Passport valid for 6 months" />
              </ul>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Entry Rules</h2>
              <div className="mb-6 space-y-[14px]">
                <RuleRow icon={Globe} title="Tourism" subtitle="Up to 90 days stay" />
                <RuleRow icon={Briefcase} title="Business" subtitle="Separate visa required" />
              </div>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Official Resources</h2>
              <div className="mb-6 overflow-hidden rounded-xl border border-[#2e2e4a] bg-[#23242e]">
                <a
                  className="flex items-center justify-between border-b border-[#2e2e4a] bg-transparent px-4 py-[15px] text-[15px] text-[#3abab6]"
                  href="https://www.ksa.emb-japan.go.jp/itprtop_en/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Embassy Website</span>
                  <ArrowUpRight className="h-4 w-4 text-black" />
                </a>
                <a className="flex items-center justify-between bg-transparent px-4 py-[15px] text-[15px] text-[#3abab6]" href="#">
                  <span>Visa Application Portal</span>
                  <ArrowUpRight className="h-4 w-4 text-black" />
                </a>
              </div>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Important Notes</h2>
              <div className="mb-6 flex items-start gap-[10px] rounded-[10px] border border-[rgba(237,137,54,0.4)] bg-[rgba(237,137,54,0.15)] p-[14px]">
                <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-black" />
                <p className="text-[13px] leading-[1.5] text-[#ed8936]">
                  Immigration may request proof of accommodation and detailed travel itinerary upon arrival.
                </p>
              </div>
            </>
          ) : activeTab === "essentials" ? (
            <>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {essentialFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    ref={(el) => {
                      essentialFilterRefs.current[filter] = el;
                    }}
                    onClick={() => {
                      setActiveFilter(filter);
                      essentialFilterRefs.current[filter]?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }}
                    className={`whitespace-nowrap rounded-[20px] px-[14px] py-1.5 text-[13px] ${
                      activeFilter === filter
                        ? "bg-[rgba(61,198,192,0.2)] font-semibold text-[#3dc6c0]"
                        : filter === "All" || filter === "Power & Plug" || filter === "Apps" || filter === "Health"
                          ? "bg-[#22223a] text-[#3dc6c0]"
                          : "bg-[#22223a] text-[#8888aa]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="mb-6 rounded-xl bg-[#272831] p-4">
                <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Power Adapters</h2>
                <div className="grid grid-cols-2 gap-[10px]">
                  {adapters.map((adapter) => (
                    <div key={adapter.name} className="flex items-center gap-[10px] rounded-xl bg-[#1e1f29] p-[14px]">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#213139]">
                      <Plug className="h-5 w-5 text-black" />
                    </span>
                      <div>
                        <p className="text-[15px] font-semibold">{adapter.name}</p>
                        <p className="text-[12px] leading-[1.5] text-[#8888aa]">{adapter.spec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <div className="mb-6 rounded-xl bg-[#272831] p-4">
                <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Essential Apps</h2>
                <div className="overflow-hidden rounded-xl">
                  {apps.map((app, index) => (
                    <div
                      key={app.name}
                      className={`flex cursor-pointer items-center gap-3 bg-[#1e1f29] px-4 py-[14px] ${
                        index !== apps.length - 1 ? "border-b border-[#2e2e4a]" : ""
                      }`}
                    >
                      <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[#213139]">
                        <app.icon className="h-5 w-5 text-black" />
                      </span>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold">{app.name}</p>
                        <p className="mt-0.5 text-[12px] text-[#8888aa]">{app.desc}</p>
                      </div>
                      <ArrowDown className="h-[18px] w-[18px] text-[#8888aa]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="my-5 h-px bg-[#2e2e4a]" />

              <div className="mb-6 rounded-xl bg-[#272831] p-4">
                <h2 className="mb-[14px] text-[17px] font-semibold text-[#c8c8e0]">Health &amp; Safety</h2>
                <h3 className="mb-[10px] mt-1 text-sm font-semibold text-[#c8c8e0]">Recommended Vaccinations</h3>
                <ul className="mb-[18px] space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Syringe className="h-[14px] w-[14px] text-black" />
                    <span>Routine Vaccines</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Syringe className="h-[14px] w-[14px] text-black" />
                    <span>Hepatitis A &amp; B</span>
                  </li>
                </ul>

                <h3 className="mb-[10px] mt-1 text-sm font-semibold text-[#c8c8e0]">Emergency Contacts</h3>
                <div className="overflow-hidden rounded-xl">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={contact.name}
                      className={`flex items-center gap-3 bg-[#1e1f29] px-4 py-[13px] ${
                        index !== emergencyContacts.length - 1 ? "border-b border-[#2e2e4a]" : ""
                      }`}
                    >
                      <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[#213139]">
                        <contact.icon className="h-[17px] w-[17px] text-black" />
                      </span>
                      <p className="flex-1 text-sm font-medium">{contact.name}</p>
                      <p className="text-[15px] font-bold text-[#4fd1c5]">{contact.number}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === "attractions" ? (
            <>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {attractionFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveAttractionFilter(filter)}
                    className={`whitespace-nowrap rounded-[20px] px-[14px] py-1.5 text-[13px] ${
                      activeAttractionFilter === filter
                        ? "bg-[rgba(61,198,192,0.2)] font-semibold text-[#3dc6c0]"
                        : filter === "All" || filter === "Temples" || filter === "Museums" || filter === "Parks"
                          ? "bg-[#22223a] text-[#3dc6c0]"
                          : "bg-[#22223a] text-[#8888aa]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {attractionCards.map((card) => (
                  <article key={card.title} className="overflow-hidden rounded-2xl bg-[#272831]">
                    <div className="relative h-[210px] w-full">
                      <Image src={card.image} alt={card.title} fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#213139]/80"
                      >
                        <Bookmark className="h-4 w-4 text-black" />
                      </button>
                    </div>

                    <div className="px-4 pb-4 pt-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-semibold">{card.title}</h3>
                        <span className="rounded-md bg-[#213139] px-3 py-1 text-[14px] font-medium text-[#3dc6c0]">
                          {card.price}
                        </span>
                      </div>

                      <p className="mb-4 text-[13px] leading-6 text-[#c1c1d8]">{card.description}</p>

                      <div className="flex items-center justify-between text-[14px] text-[#c1c1d8]">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-black" />
                          {card.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[#3dc6c0]">
                          <MapPin className="h-4 w-4 text-black" />
                          Map
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : activeTab === "months" ? (
            <>
              <div className="mb-5 rounded-xl bg-[#272831] p-3">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[12px]">
                  {weatherLegend.map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-1.5 text-[#d2d2e7]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
                <p className="mb-2 text-[13px] font-semibold">Best Time to Visit</p>
                <div className="grid grid-cols-6 gap-1">
                  {monthStrip.map((item) => (
                    <div
                      key={item.month}
                      className="min-w-0 rounded-md px-0.5 py-1 text-center text-[9px]"
                      style={{
                        background:
                          item.season === "peak"
                            ? "#2f4f4f"
                            : item.season === "shoulder"
                              ? "#3a2f48"
                              : "#28314d",
                      }}
                    >
                      <div className="mb-0.5 leading-tight text-[#aab0ca]">{item.month}</div>
                      <div className="text-[11px] leading-none">
                        {item.season === "peak" ? "☀" : item.season === "shoulder" ? "🍂" : "❄"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-5 text-[12px] text-[#d2d2e7]">
                  {weatherLegend.map((item) => (
                    <span key={`bottom-${item.label}`} className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label.replace(" Season", "")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {weatherCards.map((card) => (
                  <article key={card.title} className="rounded-xl bg-[#272831] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-[16px] font-semibold leading-5">{card.title}</h3>
                      <span className="inline-flex items-center gap-1.5 text-[14px]" style={{ color: card.seasonColor }}>
                        <span className="text-[12px]">{card.season === "Peak" ? "☀" : card.season === "Shoulder" ? "🍂" : "❄"}</span>
                        {card.season}
                      </span>
                    </div>

                    <p className="mb-1 inline-flex items-center gap-2 text-[14px] text-[#e8e8f0]">
                      <Thermometer className="h-4 w-4 text-black" />
                      {card.weather}
                    </p>
                    <p className="mb-3 text-[12px] leading-5 text-[#9da0b8]">{card.subtitle}</p>

                    <p className="mb-2 inline-flex items-center gap-2 text-[14px] font-semibold">
                      <CalendarDays className="h-4 w-4 text-black" />
                      Key Events
                    </p>
                    <ul className="space-y-1 text-[12px] text-[#d5d7e6]">
                      {card.events.map((event) => (
                        <li key={event} className="inline-flex items-center gap-2">
                          <span className="text-[12px]">•</span>
                          <span>{event}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4 text-sm text-[#8888aa]">
              Content
            </div>
          )}
        </section>

        <div className="mx-4 mb-5 mt-2 border border-[#2e2e4a] bg-[#23242e] px-4 pb-5 pt-3">
          <div className="mb-[10px] flex items-center gap-[6px] text-[13px] text-[#8888aa]">
            <ArrowRightLeft className="h-4 w-4 text-black" />
            <span>1 USD =</span>
            <span className="font-semibold text-[#e8e8f0]">151.45 JPY</span>
            <button type="button" className="ml-auto text-[#8888aa]">
              <Settings className="h-4 w-4 text-black" />
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                value={usd}
                onChange={(event) => onUsdChange(event.target.value)}
                className="w-full rounded-[10px] border-0 bg-[#1e1f29] px-3 py-[10px] text-[16px] font-medium text-[#e8e8f0] outline-none"
                type="number"
              />
              <p className="mt-1 text-center text-[11px] text-[#8888aa]">USD</p>
            </div>

            <button
              type="button"
              onClick={syncFromJpy}
              className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#23242e] text-black"
            >
              <ArrowRightLeft className="h-[18px] w-[18px] text-black" />
            </button>

            <div className="flex-1">
              <input
                value={jpy}
                onChange={(event) => onJpyChange(event.target.value)}
                className="w-full rounded-[10px] border-0 bg-[#1e1f29] px-3 py-[10px] text-[16px] font-medium text-[#e8e8f0] outline-none"
                type="number"
              />
              <p className="mt-1 text-center text-[11px] text-[#8888aa]">JPY</p>
            </div>
          </div>

          <p className="mt-[6px] text-right text-[10px] text-[#8888aa]">Last updated: 5 mins ago</p>
        </div>
      </div>
    </main>
  );
}

function ListRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3 text-sm font-normal">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#213139]">
        <Icon className="h-4 w-4 text-black" />
      </span>
      <span>{text}</span>
    </li>
  );
}

function RuleRow({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#213139]">
        <Icon className="h-[18px] w-[18px] text-black" />
      </span>
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[13px] text-[#8888aa]">{subtitle}</p>
      </div>
    </div>
  );
}
