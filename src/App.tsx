import React, { useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./App.css";

const initialLayout: Layout[] = [
  { i: "widget1", x: 0,  y: 0, w: 6, h: 4 },  // Alto sinistra
  { i: "widget2", x: 6,  y: 0, w: 6, h: 4 },  // Alto destra

  { i: "widget3", x: 0,  y: 4, w: 6, h: 4 },  // Basso sinistra
  { i: "widget4", x: 6,  y: 4, w: 6, h: 4 },  // Basso destra
];


const App: React.FC = () => {
  const [layout, setLayout] = useState<Layout[]>(initialLayout);

  return (
    <div className="app">
      <h1 className="title">Dashboard (CRA + TypeScript)</h1>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".widget-header"
      >
        <div key="widget1" className="widget">
          <div className="widget-header">Widget 1</div>
          <div className="widget-body">Contenuto widget 1</div>
        </div>

        <div key="widget2" className="widget">
          <div className="widget-header">Widget 2</div>
          <div className="widget-body">Contenuto widget 2</div>
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
