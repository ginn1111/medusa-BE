import { EventBusService, OrderService } from '@medusajs/medusa';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type InjectedDependencies = {
  eventBusService: EventBusService;
  orderService: OrderService;
};

class OrderPlacedSubscriber {
  protected readonly _orderService: OrderService;
  constructor({ eventBusService, orderService }: InjectedDependencies) {
    this._orderService = orderService;
    eventBusService.subscribe('order.placed', this.handleOrderPlaced);
  }

  handleOrderPlaced = async (data: { id: string }) => {
    const orderData = await this._orderService.retrieve(data.id, {
      relations: ['customer'],
    });
    await sgMail.send({
      templateId: process.env.SENDGRID_ORDER_PLACED_ID,
      from: process.env.SENDGRID_FROM,
      to: orderData.email,
      dynamicTemplateData: {
        ...orderData,
      },
    });
  };
}

export default OrderPlacedSubscriber;
