var minimist = require('minimist');

module.exports = {
    get: function () {
        var argv = minimist(process.argv.slice(2));
        var profiles = (argv.profiles || process.env.PROFILES || 'development').split(',');
        var serverPort = argv.server && argv.server.port || process.env.SERVER_PORT || 8080;
        var publicIp = argv.publicIp || process.env.PUBLIC_IP || null;

        return {
            endpoint: 'http://config.defensoria.defpub.local',
            application: "eureka-monitor",
            profiles: profiles,
            serverPort: serverPort,
            publicIp: publicIp,
            vizceral: {
                infoAtRequestCount: 50,
                alertAtRequestCount: 100,
                entryNodes: ['portal-defensoria-gateway', 'portal-defensoria']
            }
        };
    }
};
