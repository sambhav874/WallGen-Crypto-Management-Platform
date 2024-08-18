import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type EthGetBalanceBodyParam = FromSchema<typeof schemas.EthGetBalance.body>;
export type EthGetBalanceMetadataParam = FromSchema<typeof schemas.EthGetBalance.metadata>;
export type EthGetBalanceResponse200 = FromSchema<typeof schemas.EthGetBalance.response['200']>;
