"use client";
import React from "react";

function Header() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] to-[#3498db]">
      <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-white/20 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍺</span>
          <h1 className="text-xl font-bold font-roboto bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-transparent bg-clip-text">
            DrinkTrax
          </h1>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] to-[#3498db] p-2 md:p-6 overflow-y-auto">
        <div></div>
      </div>
    </div>
  );
}

function HeaderStory() {
  return (
    <div>
      <Header />
    </div>
  );
}

export default Header;