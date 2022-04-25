const ColorPallette = {
  okabe: {
    orange: 'rgba(230, 159, 0, 1)',
    cyan: 'rgba(86, 180, 233, 1)',
    green: 'rgba(0,158,115, 1)',
    vermillion: 'rgba(213, 94, 0, 1)',
    purple: 'rgba(204, 121, 167, 1)',
    black: 'rgba(0, 0, 0, 1)',
    blue: 'rgba(0, 114, 178, 1)',
    yellow: 'rgba(240, 228, 66, 1)',
  },
};

export default {
  accent: {
    primary: '#3EA2FF',
    secondary: '#6F8DE7',
    tertiary: '#8878CB',
  },
  actions: {
    negative: '',
    neutral: '',
    positiove: '',
  },
  core: {
    primary: '#353435',
    secondary: '#6A4E59',
    tertiary: '#A7696B',
  },
  font: {
    dark: '#222',
    light: '#fff',
  },
  chart: {
    mean: ColorPallette.okabe.cyan,
    smooted: ColorPallette.okabe.blue,
    left: ColorPallette.okabe.green,
    right: ColorPallette.okabe.purple,
    missing: ColorPallette.okabe.vermillion,
    invalid: ColorPallette.okabe.vermillion,
    outlier: {
      dilatationSpeed: {
        speed: ColorPallette.okabe.orange,
        gap: ColorPallette.okabe.black,
      },
    },
    okabe: {
      orange: 'rgba(230, 159, 0, 1)',
      cyan: 'rgba(86, 180, 233, 1)',
      green: 'rgba(0,158,115, 1)',
      vermillion: 'rgba(213, 94, 0, 1)',
      purple: 'rgba(204, 121, 167, 1)',
      black: 'rgba(0, 0, 0, 1)',
      blue: 'rgba(0, 114, 178, 1)',
    },
  },
} as const;
