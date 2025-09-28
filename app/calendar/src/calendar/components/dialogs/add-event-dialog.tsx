"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useAddEvent } from "@/calendar/hooks/use-add-event";
import { useGoals } from "@/hooks/use-goals";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { eventSchema, TCombinedFormData } from "@/calendar/schemas";

import type { TimeValue } from "react-aria-components";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  const { addEvent } = useAddEvent();
  const { goals, updateGoal } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const { isOpen, onClose, onToggle } = useDisclosure();

  const form = useForm<TCombinedFormData>({
    resolver: isEditingGoal ? undefined : zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDate: startDate || new Date(),
      startTime: startTime || { hour: 9, minute: 0 },
      endDate: startDate || new Date(),
      endTime: startTime ? { hour: startTime.hour + 1, minute: startTime.minute } : { hour: 10, minute: 0 },
      color: "blue",
      user: "",
      goalId: "",
      goalName: "",
      goalAmount: undefined,
      goalTargetDate: "",
      goalDescription: "",
    },
  });

  // Handle goal selection
  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    if (goalId && goalId !== "none" && goalId !== "") {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        form.setValue("title", `Plan: ${goal.name}`);
        form.setValue("description", `Financial goal: $${goal.amount.toLocaleString()} target by ${goal.targetDate}${goal.description ? '. ' + goal.description : ''}`);
        form.setValue("goalId", goalId);
        form.setValue("goalName", goal.name);
        form.setValue("color", "green");
        
        // Set end date to goal target date if available
        const targetDate = new Date(goal.targetDate);
        if (!isNaN(targetDate.getTime())) {
          form.setValue("endDate", targetDate);
        }
      }
    } else {
      // Reset to default values when no goal is selected
      form.setValue("title", "");
      form.setValue("description", "");
      form.setValue("goalId", "");
      form.setValue("goalName", "");
      form.setValue("color", "blue");
    }
  };

  const onSubmit = (_values: TCombinedFormData) => {
    (async () => {
      try {
        if (isEditingGoal && selectedGoal) {
          // Handle goal editing
          const goalToUpdate = goals.find(g => g.id === selectedGoal);
          if (goalToUpdate && _values.goalName && _values.goalAmount && _values.goalTargetDate) {
            const updatedGoal = {
              ...goalToUpdate,
              name: _values.goalName,
              amount: _values.goalAmount,
              targetDate: _values.goalTargetDate,
              description: _values.goalDescription || goalToUpdate.description,
            };
            
            updateGoal(selectedGoal, updatedGoal);
            onClose();
            setIsEditingGoal(false);
            setSelectedGoal("");
            return;
          }
        }

        // Handle event creation - validate required fields
        if (!_values.user || !_values.title || !_values.description || !_values.startDate || !_values.startTime || !_values.endDate || !_values.endTime || !_values.color) {
          console.error("Missing required fields for event creation");
          return;
        }

        const user = users.find(u => u.id === _values.user);
        if (!user) throw new Error("User not found");

        const startDateTime = new Date(_values.startDate);
        startDateTime.setHours(_values.startTime.hour, _values.startTime.minute);

        const endDateTime = new Date(_values.endDate);
        endDateTime.setHours(_values.endTime.hour, _values.endTime.minute);

        const event = {
          id: Date.now(),
          title: _values.title,
          description: _values.description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          color: _values.color,
          user,
          goalId: _values.goalId || "",
          goalName: _values.goalName || "",
          kind: _values.goalId ? 'goal' as const : 'other' as const,
        };

        await addEvent(event);
        onClose();
        form.reset({
          title: "",
          description: "",
          startDate: new Date(),
          startTime: { hour: 9, minute: 0 },
          endDate: new Date(),
          endTime: { hour: 10, minute: 0 },
          color: "blue",
          user: "",
          goalId: "",
          goalName: "",
          goalAmount: undefined,
          goalTargetDate: "",
          goalDescription: "",
        });
        setSelectedGoal("");
      } catch (err) {
        console.error(err);
      }
    })();
  };

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      startDate: startDate || new Date(),
      startTime: startTime || { hour: 9, minute: 0 },
      endDate: startDate || new Date(),
      endTime: startTime ? { hour: startTime.hour + 1, minute: startTime.minute } : { hour: 10, minute: 0 },
      color: "blue",
      user: "",
      goalId: "",
      goalName: "",
      goalAmount: undefined,
      goalTargetDate: "",
      goalDescription: "",
    });
  }, [startDate, startTime, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{isEditingGoal ? 'Edit Goal' : 'Add New Event'}</DialogTitle>
              <DialogDescription>
                {isEditingGoal 
                  ? 'Modify your financial goal details including amount and target date.'
                  : 'Create a new calendar event. You can link it to an existing financial goal from your planning section, or create a custom event.'
                }
              </DialogDescription>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
            >
              {isEditingGoal ? 'Create Event' : 'Edit Goal'}
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {isEditingGoal ? (
              <>
                {/* Goal Selection for Editing */}
                <div>
                  <label className="text-sm font-medium leading-none">
                    Select Goal to Edit
                  </label>
                  <Select value={selectedGoal} onValueChange={(goalId) => {
                    setSelectedGoal(goalId);
                    const goal = goals.find(g => g.id === goalId);
                    if (goal) {
                      form.setValue("goalName", goal.name);
                      form.setValue("goalAmount", goal.amount);
                      form.setValue("goalTargetDate", goal.targetDate);
                      form.setValue("goalDescription", goal.description || "");
                    }
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a goal to edit" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map(goal => (
                        <SelectItem key={goal.id} value={goal.id!}>
                          <div className="flex items-center justify-between w-full">
                            <span>{goal.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ${goal.amount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGoal && (
                  <>
                    <FormField
                      control={form.control}
                      name="goalName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Goal Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter goal name" data-invalid={fieldState.invalid} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goalAmount"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Target Amount ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="Enter target amount" 
                              data-invalid={fieldState.invalid} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goalTargetDate"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              placeholder="Select target date" 
                              data-invalid={fieldState.invalid} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goalDescription"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter goal description" 
                              data-invalid={fieldState.invalid} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Responsible</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>

                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id} className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Avatar key={user.id} className="size-6">
                                    <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                                    <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                                  </Avatar>

                                  <p className="truncate">{user.name}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Goal Selection Field */}
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Link to Financial Goal (Optional)
                  </label>
                  <Select value={selectedGoal} onValueChange={handleGoalSelect}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a goal or create custom event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Custom Event (No Goal)</SelectItem>
                      {goals.map(goal => (
                        <SelectItem key={goal.id} value={goal.id!}>
                          <div className="flex items-center justify-between w-full">
                            <span>{goal.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ${goal.amount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="title">Title</FormLabel>

                      <FormControl>
                        <Input id="title" placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel htmlFor="startDate">Start Date</FormLabel>

                        <FormControl>
                          <SingleDayPicker
                            id="startDate"
                            value={field.value}
                            onSelect={date => field.onChange(date as Date)}
                            placeholder="Select a date"
                            data-invalid={fieldState.invalid}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Time</FormLabel>

                        <FormControl>
                          <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <SingleDayPicker
                            value={field.value}
                            onSelect={date => field.onChange(date as Date)}
                            placeholder="Select a date"
                            data-invalid={fieldState.invalid}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Time</FormLabel>

                        <FormControl>
                          <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="blue">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-blue-600" />
                                Blue
                              </div>
                            </SelectItem>

                            <SelectItem value="green">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-green-600" />
                                Green
                              </div>
                            </SelectItem>

                            <SelectItem value="red">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-red-600" />
                                Red
                              </div>
                            </SelectItem>

                            <SelectItem value="yellow">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-yellow-600" />
                                Yellow
                              </div>
                            </SelectItem>

                            <SelectItem value="purple">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-purple-600" />
                                Purple
                              </div>
                            </SelectItem>

                            <SelectItem value="orange">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-orange-600" />
                                Orange
                              </div>
                            </SelectItem>

                            <SelectItem value="gray">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-neutral-600" />
                                Gray
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>

                      <FormControl>
                        <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit" disabled={isEditingGoal && !selectedGoal}>
            {isEditingGoal ? 'Update Goal' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
