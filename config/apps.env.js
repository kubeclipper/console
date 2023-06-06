const envLocal = [
  {
    name: 'kube',
    entry: 'http://localhost:8082',
    activeRule: '/kube',
    container: '#sub-app',
  },
];

module.exports = { envLocal };
