import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(

    {
      "themes": {
        "light": {
          "colors": {
            "default": {
              "50": "#f6f8f7",
              "100": "#eaefec",
              "200": "#dee5e0",
              "300": "#d2dcd5",
              "400": "#c5d2c9",
              "500": "#b9c9be",
              "600": "#99a69d",
              "700": "#78837c",
              "800": "#585f5a",
              "900": "#383c39",
              "foreground": "#000",
              "DEFAULT": "#b9c9be"
            },
            "primary": {
              "50": "#ecf9f0",
              "100": "#d1f0dc",
              "200": "#b6e7c7",
              "300": "#9cdeb3",
              "400": "#81d59e",
              "500": "#66cc8a",
              "600": "#54a872",
              "700": "#42855a",
              "800": "#306142",
              "900": "#1f3d29",
              "foreground": "#000",
              "DEFAULT": "#66cc8a"
            },
            "secondary": {
              "50": "#e6efff",
              "100": "#c3d8fe",
              "200": "#a0c1fd",
              "300": "#7daafc",
              "400": "#5a93fc",
              "500": "#377cfb",
              "600": "#2d66cf",
              "700": "#2451a3",
              "800": "#1a3b77",
              "900": "#11254b",
              "foreground": "#000",
              "DEFAULT": "#377cfb"
            },
            "success": {
              "50": "#dff4ed",
              "100": "#b3e5d4",
              "200": "#86d6ba",
              "300": "#59c7a1",
              "400": "#2db887",
              "500": "#00a96e",
              "600": "#008b5b",
              "700": "#006e48",
              "800": "#005034",
              "900": "#003321",
              "foreground": "#000",
              "DEFAULT": "#00a96e"
            },
            "warning": {
              "50": "#fff7df",
              "100": "#ffecb3",
              "200": "#ffe086",
              "300": "#ffd559",
              "400": "#ffc92d",
              "500": "#ffbe00",
              "600": "#d29d00",
              "700": "#a67c00",
              "800": "#795a00",
              "900": "#4d3900",
              "foreground": "#000",
              "DEFAULT": "#ffbe00"
            },
            "danger": {
              "50": "#ffeaeb",
              "100": "#ffcdd0",
              "200": "#ffb0b4",
              "300": "#ff9298",
              "400": "#ff757d",
              "500": "#ff5861",
              "600": "#d24950",
              "700": "#a6393f",
              "800": "#792a2e",
              "900": "#4d1a1d",
              "foreground": "#000",
              "DEFAULT": "#ff5861"
            },
            "background": "#f6fffa",
            "foreground": {
              "50": "#dfe9e3",
              "100": "#b3c9bb",
              "200": "#86aa93",
              "300": "#598b6b",
              "400": "#2d6b43",
              "500": "#004c1b",
              "600": "#003f16",
              "700": "#003112",
              "800": "#00240d",
              "900": "#001708",
              "foreground": "#fff",
              "DEFAULT": "#004c1b"
            },
            "content1": {
              "DEFAULT": "#e0f5e8",
              "foreground": "#000"
            },
            "content2": {
              "DEFAULT": "#c2ebd0",
              "foreground": "#000"
            },
            "content3": {
              "DEFAULT": "#a3e0b9",
              "foreground": "#000"
            },
            "content4": {
              "DEFAULT": "#85d6a1",
              "foreground": "#000"
            },
            "focus": "#66cc8a",
            "overlay": "#000000",
            "divider": "#111111"
          }
        },
        "dark": {
          "colors": {
            "default": {
              "50": "#101139",
              "100": "#191b5a",
              "200": "#22247c",
              "300": "#2c2e9d",
              "400": "#3538be",
              "500": "#585bc9",
              "600": "#7c7ed5",
              "700": "#9fa0e0",
              "800": "#c2c3ec",
              "900": "#e6e6f7",
              "foreground": "#fff",
              "DEFAULT": "#3538be"
            },
            "primary": {
              "50": "#000017",
              "100": "#000025",
              "200": "#000133",
              "300": "#000140",
              "400": "#00014e",
              "500": "#2d2d6d",
              "600": "#595a8c",
              "700": "#8686ab",
              "800": "#b3b3ca",
              "900": "#dfdfe9",
              "foreground": "#fff",
              "DEFAULT": "#00014e"
            },
            "secondary": {
              "50": "#10174d",
              "100": "#1a2579",
              "200": "#2333a6",
              "300": "#2d40d2",
              "400": "#364eff",
              "500": "#596dff",
              "600": "#7c8cff",
              "700": "#a0abff",
              "800": "#c3caff",
              "900": "#e6e9ff",
              "foreground": "#fff",
              "DEFAULT": "#364eff"
            },
            "success": {
              "50": "#004d11",
              "100": "#00791a",
              "200": "#00a624",
              "300": "#00d22d",
              "400": "#00ff37",
              "500": "#2dff5a",
              "600": "#59ff7d",
              "700": "#86ffa0",
              "800": "#b3ffc3",
              "900": "#dfffe6",
              "foreground": "#000",
              "DEFAULT": "#00ff37"
            },
            "warning": {
              "50": "#4d3900",
              "100": "#795a00",
              "200": "#a67c00",
              "300": "#d29d00",
              "400": "#ffbe00",
              "500": "#ffc92d",
              "600": "#ffd559",
              "700": "#ffe086",
              "800": "#ffecb3",
              "900": "#fff7df",
              "foreground": "#000",
              "DEFAULT": "#ffbe00"
            },
            "danger": {
              "50": "#4d070b",
              "100": "#790b11",
              "200": "#a61017",
              "300": "#d2141e",
              "400": "#ff1824",
              "500": "#ff404a",
              "600": "#ff6971",
              "700": "#ff9197",
              "800": "#ffbabd",
              "900": "#ffe2e4",
              "foreground": "#000",
              "DEFAULT": "#ff1824"
            },
            "background": "#000124",
            "foreground": {
              "50": "#4d4d4d",
              "100": "#797979",
              "200": "#a6a6a6",
              "300": "#d2d2d2",
              "400": "#ffffff",
              "500": "#ffffff",
              "600": "#ffffff",
              "700": "#ffffff",
              "800": "#ffffff",
              "900": "#ffffff",
              "foreground": "#000",
              "DEFAULT": "#ffffff"
            },
            "content1": {
              "DEFAULT": "#00025d",
              "foreground": "#fff"
            },
            "content2": {
              "DEFAULT": "#797cf7",
              "foreground": "#000"
            },
            "content3": {
              "DEFAULT": "#3d40c9",
              "foreground": "#fff"
            },
            "content4": {
              "DEFAULT": "#14167b",
              "foreground": "#fff"
            },
            "focus": "#667ccc",
            "overlay": "#fdfdfd",
            "divider": "#ffffff"
          }
        }
      },
      "layout": {
        "fontSize": {
          "tiny": "0.75rem",
          "small": "0.875rem",
          "medium": "1rem",
          "large": "1.125rem"
        },
        "lineHeight": {
          "tiny": "1rem",
          "small": "1.25rem",
          "medium": "1.5rem",
          "large": "1.75rem"
        },
        "radius": {
          "small": "0.5rem",
          "medium": "0.75rem",
          "large": "0.875rem"
        },
        "borderWidth": {
          "small": "1px",
          "medium": "2px",
          "large": "3px"
        },
        "disabledOpacity": "0.5",
        "dividerWeight": "1",
        "hoverOpacity": "0.9"
      }
    }
  )],
}

export default config;
