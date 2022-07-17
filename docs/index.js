const app = new Vue({
  el: '#app',
  data: {
    shops: [],
    filter: '',
  },
  computed: {
    filteredShops() {
      if (this.filter === '') return this.shops;
      const options = {
        keys: [
          'name',
          'area',
          'address',
          'industry',
          'note1',
          'note2',
          'note3',
        ]
      }
      const fuse = new Fuse(this.shops, options);
      return fuse.search(this.filter).map(x => x.item);
    }
  },
  methods: {
    mapUrl(shop) {
      return `https://google.com/maps?q=${shop.name}+${shop.address}`;
    }
  },
  async created() {
    const res = await fetch('./shops.json');
    this.shops = await res.json();
  }
})