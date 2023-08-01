import { Customer, EventBusService } from '@medusajs/medusa';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type InjectedDependencies = {
  eventBusService: EventBusService;
};

class CustomerConfirmationSubscriber {
  constructor({ eventBusService }: InjectedDependencies) {
    eventBusService.subscribe(
      'customer.created',
      this.handleCustomerConfirmation
    );
  }

  handleCustomerConfirmation = async (data: Customer) => {
    await sgMail.send({
      templateId: process.env.SENDGRID_TEMPLATE_ID_CUSTOMER_CONFIRMATION,
      from: process.env.SENDGRID_FROM,
      to: data.email,
      dynamicTemplateData: {
        first_name: data.first_name,
        last_name: data.last_name,
        shop_url: process.env.SHOP_URL,
      },
    });
  };
}

export default CustomerConfirmationSubscriber;
