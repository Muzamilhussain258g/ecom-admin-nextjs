"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateOrderStatusMutation } from "@/features/orders/hooks/use-orders";
import { ORDER_STATUSES, type Order } from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

const schema = z.object({ status: z.enum(ORDER_STATUSES) });
type StatusForm = z.infer<typeof schema>;

export function OrderStatusForm({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateOrderStatusMutation();
  const initialStatus = schema.shape.status.safeParse(order.status);
  const form = useForm<StatusForm>({
    resolver: zodResolver(schema),
    defaultValues: { status: initialStatus.success ? initialStatus.data : undefined },
  });
  const busy = form.formState.isSubmitting;
  const selectedStatus = useWatch({ control: form.control, name: "status" });

  const submit = form.handleSubmit(async (payload) => {
    if (payload.status === order.status) return;
    try {
      await mutation.mutateAsync({ id: order.id, payload });
      setOpen(false);
      onSaved();
    } catch (error) {
      form.setError("root", { message: getApiErrorMessage(error, "Unable to update order status.") });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (busy) return;
      if (nextOpen) {
        const current = schema.shape.status.safeParse(order.status);
        form.reset({ status: current.success ? current.data : undefined });
      }
      setOpen(nextOpen);
    }}>
      <DialogTrigger render={<Button variant="outline" />}>Update status</DialogTrigger>
      <DialogContent showCloseButton={!busy} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>Current status: <span className="font-medium capitalize text-foreground">{order.status}</span>. Choose the new status and confirm the change.</DialogDescription>
        </DialogHeader>
    <form onSubmit={submit} className="space-y-5" aria-label="Update order status" aria-busy={busy}>
      <div className="flex flex-wrap items-end gap-3">
        <Controller control={form.control} name="status" render={({ field, fieldState }) => (
          <Field className="w-full" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`order-${order.id}-status`}>Order status</FieldLabel>
            <Select name={field.name} value={field.value ?? null} onValueChange={(value) => { field.onChange(value); form.clearErrors("root"); }} disabled={busy}>
              <SelectTrigger id={`order-${order.id}-status`} ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} className="w-full">
                <SelectValue placeholder="Choose a status" />
              </SelectTrigger>
              <SelectContent>{ORDER_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />
      </div>
      {selectedStatus === "delivered" && <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">Marking this order delivered also marks its cash on delivery payment as successful.</p>}
      {(selectedStatus === "cancelled" || selectedStatus === "returned") && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">Confirm that you want to mark this order as <strong>{selectedStatus}</strong>.</p>}
      {form.formState.errors.root && <p role="alert" className="text-destructive text-sm">{form.formState.errors.root.message}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" disabled={busy || !selectedStatus || selectedStatus === order.status}>{busy ? "Saving..." : "Save changes"}</Button>
      </DialogFooter>
    </form>
      </DialogContent>
    </Dialog>
  );
}
