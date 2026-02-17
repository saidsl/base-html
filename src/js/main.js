// Import our custom CSS
// import '../css/slateworks.css';

const { createApp, reactive, toRefs, provide, inject, onMounted } = Vue;
const APP_STATE_KEY = 'app-state';

const registerPartials = (app) => {
  const modules = import.meta.glob('../partials/*.html', {
    eager: true,
    query: '?raw',
    import: 'default',
  });

  Object.entries(modules).forEach(([path, html]) => {
    const file = path.split('/').pop() || '';
    const name = file.replace('.html', '');
    const componentName = `site-${name}`;
    app.component(componentName, {
      template: html,
      props: {
        state: {
          type: Object,
          default: () => ({}),
        },
      },
      setup(props) {
        const injectedState = inject(APP_STATE_KEY, {});

        // Expose a merged context: local `state` prop wins over injected global state.
        return new Proxy(
          {},
          {
            get(_, key) {
              if (key in props.state) {
                return props.state[key];
              }
              return injectedState[key];
            },
            has(_, key) {
              return key in props.state || key in injectedState;
            },
          }
        );
      },
    });
  });
};

const app = createApp({
  setup() {
    const state = reactive({
      nav: [],
      aside: [],
      footer: [],
      message: 'Site is Wired',
    });
    provide(APP_STATE_KEY, state);

    const loadJson = async (name) => {
      try {
        const response = await fetch(new URL(`../data/${name}.json`, import.meta.url));
        state[name] = await response.json();
      } catch (error) {
        console.error(`Failed to load JSON for "${name}":`, error);
      }
    };

    const loadDatasets = async (names) => {
      await Promise.all(names.map((name) => loadJson(name)));
    };

    onMounted(() => loadDatasets(['nav', 'aside','footer']));

    return toRefs(state);
  },
});

registerPartials(app);
app.mount('#app');
