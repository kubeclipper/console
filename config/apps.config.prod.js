const now = new Date().getTime();

const entryIndex = `index.html?t=${now}`;

module.exports = [
  {
    name: 'kube',
    entry: `/kube/${entryIndex}`,
    activeRule: '/kube',
    container: '#sub-app',
    props: {
      subAppTitle: {
        changeTitle: false,
      },
    },
  },
];
