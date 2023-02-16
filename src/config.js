const CONFIG = {
    'medium-uv-rh': {
        levels: [1000, 925, 850, 700, 500, 300, 250, 200]
    },

    'medium-uv-z': {
        levels: [1000, 925, 850, 700, 500, 300, 250, 200]
    },
    'medium-divergence': {
        levels: [1000, 925, 700, 500, 300],
        name: 'divergence'
    },
    'medium-vorticity': {
        levels: [850, 700, 500, 300, 250],
        name: 'vorticity'
    },
    'medium-pv': {
        levels: [500, 300],
        name: 'pv'
    },
    'medium-wind-10wg': {
        levels: [1000],
        name: 'medium-wind-10wg'
    },
    'medium-shear': {
        levels: [1000],
        name: 'medium-shear'
    },
    'medium-precipitation-type': {
        levels: [1000],
        name: 'medium-precipitation-type'
    },
    'medium-rain-acc': {
        levels: [1000],
        name: 'medium-rain-acc'
    },
    'medium-rain-rate': {
        levels: ['tp_rate', 'lsp_rate', 'cp_rate', 'sf_rate'],
        name: ''
    },
    'medium-visibility': {
        levels: [1000],
        name: 'medium-visibility'
    },
    'opencharts_meteogram': {
        levels: ['classical_15d_with_climate', 'classical_wave', 'classical_10d', 'classical_plume', 'classical_15d'],
        name: 'Luoyang',
        type: 'point-based'
    },
    'opencharts_vertical-profile-meteogram': {
        levels: ['opencharts_vertical-profile-meteogram'],
        name: 'Luoyang',
        type: 'point-based-profile'
    },
};

export default CONFIG;

