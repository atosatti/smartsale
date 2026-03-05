/**
 * Mock data do Mercado Livre para testes em ambientes com restrição de rede
 */

export const mockSearchResults = {
  results: [
    {
      id: 'MLB2345678901',
      title: 'Notebook Gamer Intel Core i7 16GB RAM SSD 512GB',
      price: 2500,
      currency_id: 'BRL',
      thumbnail: 'https://m.media-amazon.com/images/I/71hTTmR4qqL._AC_SY300_.jpg',
      condition: 'new',
      seller: {
        id: 123456,
        nickname: 'loja-premium',
        type: 'normal',
        power_seller_status: 'platinum'
      },
      shipping: {
        free_shipping: true
      },
      attributes: [
        { name: 'Marca', value_name: 'Intel' },
        { name: 'Memória', value_name: '16 GB' }
      ]
    },
    {
      id: 'MLB3456789012',
      title: 'Notebook i5 8GB 256GB SSD Tela 15.6 Polegadas',
      price: 1800,
      currency_id: 'BRL',
      thumbnail: 'https://m.media-amazon.com/images/I/71qJG7UzpgL._AC_SY300_.jpg',
      condition: 'new',
      seller: {
        id: 234567,
        nickname: 'tech-store',
        type: 'normal',
        power_seller_status: 'gold'
      },
      shipping: {
        free_shipping: true
      },
      attributes: [
        { name: 'Marca', value_name: 'Dell' },
        { name: 'Memória', value_name: '8 GB' }
      ]
    },
    {
      id: 'MLB4567890123',
      title: 'Notebook Ultrabook AMD Ryzen 5 16GB 512GB',
      price: 2200,
      currency_id: 'BRL',
      thumbnail: 'https://m.media-amazon.com/images/I/61X0VIBt8VL._AC_SY300_.jpg',
      condition: 'new',
      seller: {
        id: 345678,
        nickname: 'eletrônicos-brasil',
        type: 'normal',
        power_seller_status: 'platinum'
      },
      shipping: {
        free_shipping: true
      },
      attributes: [
        { name: 'Marca', value_name: 'AMD' },
        { name: 'Memória', value_name: '16 GB' }
      ]
    }
  ],
  paging: {
    total: 3,
    offset: 0,
    limit: 50
  }
};

export const mockProductDetails = {
  id: 'MLB2345678901',
  title: 'Notebook Gamer Intel Core i7 16GB RAM SSD 512GB - Modelo Premium 2024',
  price: 2500,
  currency_id: 'BRL',
  initial_quantity: 10,
  sold_quantity: 25,
  available_quantity: 10,
  condition: 'new',
  description: {
    plain_text: 'Notebook gamer de alta performance com processador Intel Core i7 de última geração, 16GB de memória RAM DDR4, SSD de 512GB para armazenamento rápido. Tela IPS 15.6 polegadas Full HD 144Hz ideal para games. GPU NVIDIA RTX 3060, bateria de 8 horas, teclado RGB. Perfeito para jogos, programação e edição de vídeos.'
  },
  pictures: [
    { url: 'https://m.media-amazon.com/images/I/71hTTmR4qqL._AC_SY1000_.jpg', secure_url: 'https://m.media-amazon.com/images/I/71hTTmR4qqL._AC_SY1000_.jpg' },
    { url: 'https://m.media-amazon.com/images/I/71F4VIiBUML._AC_SY1000_.jpg', secure_url: 'https://m.media-amazon.com/images/I/71F4VIiBUML._AC_SY1000_.jpg' },
    { url: 'https://m.media-amazon.com/images/I/71rM7Xu3BnL._AC_SY1000_.jpg', secure_url: 'https://m.media-amazon.com/images/I/71rM7Xu3BnL._AC_SY1000_.jpg' }
  ],
  category_id: 'MLB5672',
  category_name: 'Computadores Portáteis',
  seller_id: 123456,
  attributes: [
    { name: 'Marca', value_name: 'ASUS' },
    { name: 'Modelo', value_name: 'TUF Gaming F15' },
    { name: 'Processador', value_name: 'Intel Core i7' },
    { name: 'Geração do Processador', value_name: '12ª Geração' },
    { name: 'Memória RAM', value_name: '16GB' },
    { name: 'Tipo de Memória RAM', value_name: 'DDR4' },
    { name: 'Armazenamento', value_name: 'SSD 512GB' },
    { name: 'Tamanho da Tela', value_name: '15.6 polegadas' },
    { name: 'Resolução', value_name: 'Full HD' },
    { name: 'Taxa de Atualização', value_name: '144Hz' },
    { name: 'Placa de Vídeo', value_name: 'NVIDIA GeForce RTX 3060' }
  ]
};

export const mockPriceHistory = [
  { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2799 },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2799 },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2699 },
  { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2699 },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2599 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 2500 },
  { date: new Date().toISOString().split('T')[0], price: 2500 }
];
