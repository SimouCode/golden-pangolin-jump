"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { Goal, useGoals } from '@/contexts/GoalContext';

interface EditGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

const EditGoalDialog: React.FC<EditGoalDialogProps> = ({ isOpen, onClose, goal }) => {
  const { t } = useTranslation();
  const { updateGoal } = useGoals();

  const [goalName, setGoalName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (goal) {
      setGoalName(goal.name);
      setTargetAmount(goal.target_amount.toString());
      setDueDate(goal.deadline);
      setDescription(goal.description || '');
    }
  }, [goal]);

  const handleUpdateGoal = async () => {
    if (!goal) return;

    const parsedTargetAmount = parseFloat(targetAmount);

    if (!goalName || isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      showError(t('goal_save_error_fields'));
      return;
    }

    const updated = await updateGoal({
      id: goal.id,
      name: goalName,
      target_amount: parsedTargetAmount,
      saved_amount: goal.saved_amount, // Keep current saved amount
      deadline: dueDate,
      description,
    });

    if (updated) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_goal')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">{t('goal_name')}</Label>
            <Input
              id="goalName"
              placeholder={t('goal_name_placeholder')}
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">{t('target_amount')}</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder={formatCurrency(0, t('currency_locale'))}
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t('due_date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>{t('pick_a_date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description_optional')}</Label>
            <Textarea
              id="description"
              placeholder={t('goal_description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleUpdateGoal}>{t('update')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;