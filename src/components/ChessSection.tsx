import { ReactNode } from "react";

const ChessSection: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <section className="chess-section container mx-auto">
      <div className="rounded-lg section-card">
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
};

export default ChessSection;
