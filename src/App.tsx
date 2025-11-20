import React, { useEffect, useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import WeatherWidget from "./WeatherWidget";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./App.css";

const LAYOUT_KEY = "dashboard-layout";

// Layout di default (2x2)
const defaultLayout: Layout[] = [
  { i: "widget1", x: 0, y: 0, w: 5, h: 4, minW: 3, maxW: 5, minH: 3 },
  { i: "widget2", x: 6, y: 0, w: 5, h: 4, minW: 3, maxW: 5, minH: 3 },

  { i: "widget3", x: 0, y: 4, w: 5, h: 4, minW: 3, maxW: 5, minH: 3 },
  { i: "widget4", x: 6, y: 4, w: 5, h: 4, minW: 3, maxW: 5, minH: 3 },
];

const App: React.FC = () => {
  // Carico da localStorage se esiste, altrimenti default
  const [layout, setLayout] = useState<Layout[]>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Layout[];
      } catch {
        return defaultLayout;
      }
    }
    return defaultLayout;
  });

  // larghezza = 97% della finestra
  const [width, setWidth] = useState<number>(window.innerWidth * 0.98);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth * 0.98);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(newLayout));
  };

  return (
    <div className="app">
      <h1 className="title">Interactive Dashboard</h1>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={40}
        width={width}
        isDraggable={true}
        isResizable={true}
        resizeHandles={["se", "sw"]}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-header"
      >
        <div key="widget1" className="widget">
          <div className="widget-header">Widget 1</div>
          <div className="widget-body">Contenuto widget 1</div>
        </div>

        <div key="widget2" className="widget">
          <div className="widget-header">Meteo</div>
          <div className="widget-body">
            <WeatherWidget />
          </div>
        </div>



        <div key="widget3" className="widget">
          <div className="widget-header">Widget 3</div>
          <div className="widget-body">Contenuto widget 3</div>
        </div>

        <div key="widget4" className="widget">
          <div className="widget-header">Widget 4</div>
          <div className="widget-body">Contenuto widget 4</div>
        </div>
      </GridLayout>
    </div>
  );
};

export default App;
