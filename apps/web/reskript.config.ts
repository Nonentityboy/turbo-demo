import {configure} from '@reskript/settings';

export default configure(
    'webpack',
    {
        // https://reskript.dev/docs/settings/feature-matrix
        featureMatrix: {
            stable: {},
            dev: {},
        },
        // https://reskript.dev/docs/settings/build
        build: {
            appTitle: 'curtin-test',
        },
        // https://reskript.dev/docs/settings/dev-server
        devServer: {
            port: 8788,
            // TODO: 修改后端API代理的配置
            apiPrefixes: ['/api'],
            defaultProxyDomain: 'example.com',
        },
    }
);
