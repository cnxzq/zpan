import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'Breadcrumbs',
  props: {
    path: {
      type: String,
      default: '',
    },
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    const parts = computed(() => {
      if (!props.path) return [];
      return props.path.split('/').filter(p => p);
    });

    const navigateTo = (index) => {
      emit('navigate', parts.value.slice(0, index + 1));
    };

    return {
      parts,
      navigateTo,
    };
  },
  template: `
    <div class="breadcrumbs">
      <a @click="navigateTo(-1)" href="#">/</a>
      <template v-for="(part, index) in parts" :key="index">
        <span> / </span>
        <a @click="navigateTo(index)" href="#">
          {{ part }}
        </a>
      </template>
    </div>
  `,
});
