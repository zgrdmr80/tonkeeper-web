import { FC } from 'react';
import { DashboardCell as DashboardCellProps } from '../../../hooks/dashboard/dashboard-column';
import { StringCell } from './StringCell';
import { AddressCell } from './AddressCell';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { NumericCell } from './NumericCell';
import { NumericCryptoCell } from './NumericCryptoCell';
import { NumericFiatCell } from './NumericFiatCell';
import { Body2 } from '../../Text';

export const DashboardCell: FC<DashboardCellProps> = props => {
    switch (props.type) {
        case 'string':
            return <StringCell value={props.value} />;
        case 'address':
            return <AddressCell raw={props.raw} network={Network.MAINNET} />;
        case 'numeric':
            return <NumericCell value={props.value} decimalPlaces={props.decimalPlaces} />;
        case 'numeric_crypto':
            return (
                <NumericCryptoCell
                    value={props.value}
                    decimals={props.decimals}
                    symbol={props.symbol}
                />
            );
        case 'numeric_fiat':
            return <NumericFiatCell value={props.value} fiat={props.fiat} />;
        default:
            return <Body2>{(props as unknown as { value: string }).value}</Body2>;
    }
};
