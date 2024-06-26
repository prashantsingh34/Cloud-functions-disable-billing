import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import {cloudEvent} from '@google-cloud/functions-framework'
const PROJECT_ID = 'gcp-project-427217';
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billing = google.cloudbilling('v1').projects;


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
    console.log("Auth credentials set");
};


const disableBillingForProject = async (projectName) => {
    const res =await billing.updateBillingInfo({
        name: projectName,
        resource: {
            billingAccountName: '',
        },
    });
    console.log("Billing disabled");
    return `Billing has been disabled: ${JSON.stringify(res.data)}`;
};




cloudEvent('stopBilling', async stopBilling => {
    const pubsub = stopBilling.data;

      const pubsubDataObj = JSON.parse(
        Buffer.from(pubsub.message.data, 'base64').toString()
      );
    _setAuthCredential();
    if (pubsubDataObj.costAmount >= pubsubDataObj.budgetAmount) {
            console.log("disabling billing", pubsubDataObj.costAmount, pubsubDataObj.budgetAmount);
            return disableBillingForProject(PROJECT_NAME);
        }
        else {
            console.log('Current amount is less than the buget set. No need to disasble billing')
            return 'Bill is under limit already. No need to disable billing';
        }
});






