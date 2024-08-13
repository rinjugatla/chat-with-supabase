import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    return {
        id: isNaN(parseFloat(params.roomid)) ? -1 : params.roomid as unknown as number
    }
};
