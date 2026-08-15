/* ==========================================================================
   Breezify 3D Weather Scene Controller & Interactive Parallax
   ========================================================================== */

function init3DParallax() {
  const heroSection = document.getElementById("heroSection");
  const hero3DScene = document.getElementById("hero3DScene");

  if (heroSection && hero3DScene) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 18;
      const rotateX = -y * 14;

      hero3DScene.style.transform = `translateX(-50%) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });

    heroSection.addEventListener("mouseleave", () => {
      hero3DScene.style.transform = `translateX(-50%) rotateY(0deg) rotateX(0deg)`;
    });
  }
}

function update3DWeatherScene(weatherCode, isDay = 1) {
  const hero3DScene = document.getElementById("hero3DScene");
  if (!hero3DScene) return;

  hero3DScene.classList.remove(
    "condition-clear",
    "condition-cloudy",
    "condition-rain",
    "condition-thunderstorm",
    "condition-snow",
    "condition-fog",
    "is-night"
  );

  if (!isDay) {
    hero3DScene.classList.add("is-night");
  }

  if (weatherCode === 0 || weatherCode === 1) {
    hero3DScene.classList.add("condition-clear");
  } else if (weatherCode === 2 || weatherCode === 3) {
    hero3DScene.classList.add("condition-cloudy");
  } else if (weatherCode === 45 || weatherCode === 48) {
    hero3DScene.classList.add("condition-fog");
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    hero3DScene.classList.add("condition-rain");
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    hero3DScene.classList.add("condition-thunderstorm");
  } else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    hero3DScene.classList.add("condition-snow");
  } else {
    hero3DScene.classList.add("condition-cloudy");
  }
}
