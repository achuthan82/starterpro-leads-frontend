import {
    Card, Pagination, PaginationItems, PaginationNext, PaginationPrevious, Spinner
} from 'components/ui';
import {
    Table, TBody, Td, Th, THead, Tr,
} from 'components/ui/Table';
import { useEffect, useState } from 'react';
import subscriptionService from "utils/subscriptionService"
import moment from 'moment';

const PreviousSubscriptions = () => {
    const [previousList, setPreviousList] = useState([])
    const [pagination, setPagination] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const getPreviousSubscriptions = (page, per_page) => {
        setLoading(true)
        subscriptionService.getPreviousSubscription(page, per_page).then((response) => {
            if (response.data.status === 200) {
                setPreviousList(response.data.data)
                setPagination(response.data.pagination)
            } else if (response.data.staus === 204) {
                setPreviousList([])
                setPagination(null)
            } else {
                setPreviousList([])
                setPagination(null)
            }
        }).catch(() => {
            setPreviousList([])
            setPagination(null)
        }).finally(() => {
            setLoading(false)
        })
    }

    const handlePage = (val) => {
        setCurrentPage(val)
        getPreviousSubscriptions(val, 5)
    }

    useEffect(() => {
        getPreviousSubscriptions(1, 5)
    }, [])

    return (
        <div>
            <Card>
                <div className={`p-6 ${previousList.length > 0 ? 'bg-white shieldnest-shadow' : 'bg-transparent'} overflow-hidden rounded-xl dark:bg-gray-800 dark:border-gray-700`}>
                    {
                        loading ? <Spinner /> : (
                            <>
                            {previousList && previousList.length > 0 ? (
                            <Table className="w-full text-left dark:border-gray-700 dark:bg-gray-800">
                                <THead>
                                    <Tr>
                                        <Th>Subscription Name</Th>
                                        <Th>Status</Th>
                                        <Th>Cancellation Reason</Th>
                                        <Th>Started At</Th>
                                        <Th>Stripe ID</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {previousList.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item?.name || '—'}</Td>
                                            <Td className="capitalize">{item?.status || '—'}</Td>
                                            <Td>{item?.cancelation_reason || '—'}</Td>
                                            <Td>
                                                {item?.started_at ? moment(item.started_at).format('MMM DD, YYYY') : '—'}
                                            </Td>
                                            <Td>{item?.stripe_subscription_id || '—'}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                            ) : (<div className="text-center p-0">
                                    <h3 className="text-lg font-medium  dark:text-white">No Previous Subscription Found</h3>
                                    <p className="mt-2 mb-0 text-sm text-gray-500">
                                        You do not have any previous subscriptions.
                                    </p>
                                </div>)}
                            </>
                        )
                    }


                    {pagination && <div className="flex justify-center items-center mt-6">
                        <div className="max-w-xl">
                                <Pagination total={Math.ceil((pagination.total / 10))} value={currentPage} onChange={(val) => handlePage(val)}>
                                    <PaginationPrevious />
                                    <PaginationItems />
                                    <PaginationNext />
                                </Pagination>
                            </div>
                    </div>}
                </div>
            </Card>
        </div>
    )
}

export default PreviousSubscriptions