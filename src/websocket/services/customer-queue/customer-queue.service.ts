// customer-queue.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class CustomerQueueService implements OnModuleDestroy {
  private queues: Map<string, Subject<any>> = new Map();
  private subscriptions: Map<string, Subscription> = new Map(); // Changed from processors to subscriptions

  getOrCreateQueue(customerId: string): Subject<any> {
    if (!this.queues.has(customerId)) {
      const queue = new Subject<any>();
      this.queues.set(customerId, queue);

      // Create a processor that handles messages sequentially
      const processor = queue.pipe(
        concatMap(async (message) => {
          try {
            return await message();
          } catch (error) {
            console.error(
              `Error processing message for customer ${customerId}:`,
              error,
            );
            throw error;
          }
        }),
      );

      // Store the subscription instead of the processor
      this.subscriptions.set(
        customerId,
        processor.subscribe(), // This returns a Subscription
      );
    }

    return this.queues.get(customerId)!;
  }

  // Clean up subscriptions when the module is destroyed
  onModuleDestroy() {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
    this.queues.clear();
  }
}
