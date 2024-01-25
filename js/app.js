document.addEventListener('DOMContentLoaded', function () {
  let start = 0;
  let itemsPerPage = 12;
  let data = [];
  let loadingElement = document.getElementById('loading');

  function showLoading() {
    requestAnimationFrame(() => loadingElement.classList.add('show'));
  }

  function hideLoading() {
    loadingElement.classList.remove('show');
  }

  function fetchAndRenderProducts(startIndex, count) {
    showLoading();
    let slicedData = data.slice(startIndex, startIndex + count);
    renderProducts(slicedData);
  }

  function renderProducts(products) {
    let productsContainer = document.querySelector('.catalog');
    let promises = [];

    products.forEach(product => {
      let productHTML = productItem(product);
      productsContainer.innerHTML += productHTML;

      // Cria uma Promise para carregar cada imagem
      let imgPromise = new Promise(resolve => {
        let img = new Image();
        img.onload = resolve;
        img.src = product.image_link;
      });

      promises.push(imgPromise);
    });

    Promise.all(promises).then(hideLoading);
  }

  function formatPrice(price) {
    return (price * 5.50).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function productItem(product) {
    return `
      <div class="product" 
           data-name="${product.name}" 
           data-brand="${product.brand}" 
           data-type="${product.product_type}" 
           tabindex="508">
        <figure class="product-figure">
          <img src="${product.image_link}" 
               width="180" 
               height="180" 
               alt="${product.name}" 
               onerror="javascript:this.src='img/unavailable.png'">
        </figure>
        <section class="product-description">
          <h1 class="product-name">${product.name}</h1>
          <div class="product-brands">
            <span class="product-brand background-brand">${product.brand}</span>
            <span class="product-brand background-price">${formatPrice(product.price)}</span>
          </div>
        </section>
      </div>`;
  }

  function updateStartIndex() {
    start += itemsPerPage;
  }

  document.getElementById('showMoreBtn').addEventListener('click', function () {
    updateStartIndex();
    fetchAndRenderProducts(start, itemsPerPage);
  });

  function handleErrors(response) {
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    return response.json();
  }

  function updateFilterOptions(filterElement, values) {
    filterElement.innerHTML = '<option value="">Todos</option>';
    values.forEach(value => {
      let option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      filterElement.appendChild(option);
    });
  }

  function loadAllData() {
    let url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
  
    fetch(url)
      .then(handleErrors)
      .then(apiData => {
        data = apiData.map(product => ({ ...product, rating: product.rating }));
  
        let uniqueTypes = [...new Set(data.map(product => product.product_type))];
        let brands = [...new Set(data.map(product => product.brand))];
  
        updateFilterOptions(document.getElementById('filter-type'), uniqueTypes);
        updateFilterOptions(document.getElementById('filter-brand'), brands);
  
        fetchAndRenderProducts(start, itemsPerPage);
      })
      .catch(err => console.error(err));
  }

  ['filter-brand', 'filter-type'].forEach(id => {
    document.getElementById(id).addEventListener('change', function () {
      let selectedValue = this.value;
      let filteredData = data.filter(product => selectedValue === '' || product[id.split('-')[1]] === selectedValue);
      document.querySelector('.catalog').innerHTML = '';
      renderProducts(filteredData);
    });
  });

  loadAllData();
});
