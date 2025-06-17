const NotFoundView = {
  render() {
    return `
      <main id="main-content" class="container" tabindex="-1">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Ups! Sepertinya halaman yang Anda tuju tidak tersedia.</p>
      </main>
    `;
  },

  afterRender() {},
};

export default NotFoundView;
