const r = new Ractive({
    el: 'body',
    template: '#template',
    computed: {
        totalLogs: function () {
            const self = this;
            const data = self.get('data.data');
            return Object.keys(data)
                .reduce((acc, key) => {
                    const matches = data[key];
                    return acc + matches.length;
                }, 0);
        },
        totalTestedLogs: function () {
            const self = this;
            const data = self.get('data.data');
            return Object.keys(data)
                .reduce((acc, key) => {
                    const matches = data[key];
                    return acc + matches.filter(a => a.isCovered).length;
                }, 0);
        }
    },
    data: {
        countCovered: function (arr) {
            return arr.filter(v => v.isCovered).length;
        }
    }
});

fetch('./reportData.json')
    .then(d => d.json())
    .then((data) => {
        r.set('data',
            data
        );
    });