import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'gcp-project-427217';
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billing = google.cloudbilling('v1').projects;

export async function stopBilling(pubsubEvent) {

    const pubsubData = pubsubEvent.data ? Buffer.from(pubsubEvent.data, 'base64').toString() : 'Hello world';


    if (pubsubData.costAmount <= pubsubData.budgetAmount) {
        return `No need to stop billing. (Current bill: ${pubsubData.costAmount})`;
    }

    if (!PROJECT_ID) {
        return 'Project ID not provided';
    }

    _setAuthCredential();

    const billingEnabled = await isBillingEnabled(PROJECT_NAME);
    if (billingEnabled) {
        console.log("disabling billing", pubsubData.costAmount, pubsubData.budgetAmount );
        return disableBillingForProject(PROJECT_NAME);
    } else {
        return 'Billing already disabled';
    }
}


const _setAuthCredential = () => {
    const client = new GoogleAuth({
        scopes: [
            'https://www.googleapis.com/auth/cloud-billing',
            'https://www.googleapis.com/auth/cloud-platform',
        ],
    });

    google.options({
        auth: client,
    });
};


const isBillingEnabled = async (projectName) => {
    try {
        const res = await billing.getBillingInfo({
            name: projectName
        });
        return res.data.billingEnabled;
    } catch (e) {
        console.log(
            'Cant find  if billing is enabled for this project, So assuming that  billing is enabled'
        );
        return true;
    }
};


const disableBillingForProject =  (projectName) => {
    const res = billing.updateBillingInfo({
        name: projectName,
        resource: {
            billingAccountName: ''
        }, 
    });
    return `Billing has been disabled: ${JSON.stringify(res.data)}`;
};







