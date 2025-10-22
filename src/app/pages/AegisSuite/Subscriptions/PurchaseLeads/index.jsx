// import {Card} from 'components/ui'
// import { useParams } from "react-router";
import MailerRequestForm from "./MailRequestForm";


const PurchaseLeads = ({selectedPlan, plans}) => {
    // const params = useParams()
    return (
        <div>
            {/* <Card> */}
                    <div className="">
                        <MailerRequestForm selectedPlan={selectedPlan} plans={plans}></MailerRequestForm>
                    </div>
            {/* </Card> */}
        </div>
    );
};

export default PurchaseLeads;
