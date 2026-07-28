import { $ } from 'bun';

await $`rm -rf dist`;
await $`bun x tsc --outDir dist --declaration --declarationMap --sourceMap`;
console.log('nest-auth-provider-github built');
