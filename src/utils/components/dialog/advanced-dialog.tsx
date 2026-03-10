"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Trash2,
  Send,
  Settings,
  Loader2,
  Save,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos de dialog con estilos específicos
export type AdvancedDialogType =
  | "confirmation"
  | "destructive"
  | "warning"
  | "success"
  | "info"
  | "custom";

// Tipos de iconos con estilos elaborados
export type AdvancedDialogIcon =
  | "warning"
  | "success"
  | "info"
  | "delete"
  | "send"
  | "settings"
  | "alert"
  | "shield"
  | "help"
  | "custom";

// Interface para botones avanzados
export interface AdvancedDialogButton {
  label: string;
  onClick?: (
    e?:
      | React.MouseEvent<HTMLButtonElement>
      | React.FormEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  loadingText?: string;
}

// Interface principal del componente avanzado
export interface AdvancedDialogProps {
  // Control de visibilidad
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Contenido principal
  title: string;
  subtitle?: string;
  description?: string;
  question?: string;

  // Configuración visual
  type?: AdvancedDialogType;
  icon?: AdvancedDialogIcon | React.ReactNode;
  showIcon?: boolean;
  iconAnimation?: boolean;

  // Botones
  confirmButton?: AdvancedDialogButton;
  cancelButton?: AdvancedDialogButton;
  customButtons?: AdvancedDialogButton[];

  // Configuración de diseño
  maxWidth?: "sm" | "md" | "lg" | "xl";
  preventClose?: boolean;
  showDivider?: boolean;

  // Contenido personalizado
  children?: React.ReactNode;
  contentCard?: boolean;
}

// Configuraciones de iconos con estilos elaborados
const advancedIconConfigs = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    shadowColor: "shadow-amber-200/50 dark:shadow-amber-900/50",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    shadowColor: "shadow-green-200/50 dark:shadow-green-900/50",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    shadowColor: "shadow-blue-200/50 dark:shadow-blue-900/50",
  },
  delete: {
    icon: Trash2,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    shadowColor: "shadow-red-200/50 dark:shadow-red-900/50",
  },
  send: {
    icon: Send,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    shadowColor: "shadow-blue-200/50 dark:shadow-blue-900/50",
  },
  settings: {
    icon: Settings,
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    iconColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700",
    shadowColor: "shadow-gray-200/50 dark:shadow-gray-800/50",
  },
  alert: {
    icon: AlertCircle,
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    shadowColor: "shadow-amber-200/50 dark:shadow-amber-900/50",
  },
  shield: {
    icon: ShieldAlert,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    shadowColor: "shadow-red-200/50 dark:shadow-red-900/50",
  },
  help: {
    icon: HelpCircle,
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    shadowColor: "shadow-purple-200/50 dark:shadow-purple-900/50",
  },
  custom: {
    icon: Info,
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    iconColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700",
    shadowColor: "shadow-gray-200/50 dark:shadow-gray-800/50",
  },
};

// Configuraciones por tipo de dialog
const typeConfigs: Record<
  AdvancedDialogType,
  {
    defaultIcon: AdvancedDialogIcon;
    confirmVariant: AdvancedDialogButton["variant"];
    confirmLabel: string;
    confirmIcon: React.ReactNode;
  }
> = {
  confirmation: {
    defaultIcon: "info",
    confirmVariant: "default",
    confirmLabel: "Confirmar",
    confirmIcon: <Save className="mr-2 h-4 w-4" />,
  },
  destructive: {
    defaultIcon: "delete",
    confirmVariant: "destructive",
    confirmLabel: "Eliminar",
    confirmIcon: <Trash2 className="mr-2 h-4 w-4" />,
  },
  warning: {
    defaultIcon: "warning",
    confirmVariant: "default",
    confirmLabel: "Continuar",
    confirmIcon: <AlertTriangle className="mr-2 h-4 w-4" />,
  },
  success: {
    defaultIcon: "success",
    confirmVariant: "default",
    confirmLabel: "Continuar",
    confirmIcon: <CheckCircle className="mr-2 h-4 w-4" />,
  },
  info: {
    defaultIcon: "info",
    confirmVariant: "default",
    confirmLabel: "Entendido",
    confirmIcon: <Info className="mr-2 h-4 w-4" />,
  },
  custom: {
    defaultIcon: "info",
    confirmVariant: "default",
    confirmLabel: "Aceptar",
    confirmIcon: <Save className="mr-2 h-4 w-4" />,
  },
};

export function AdvancedDialogERP({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  question,
  type = "confirmation",
  icon,
  showIcon = true,
  iconAnimation = true,
  confirmButton,
  cancelButton,
  customButtons,
  maxWidth = "md",
  preventClose = false,
  showDivider = true,
  children,
  contentCard = true,
}: AdvancedDialogProps) {
  const config = typeConfigs[type];

  // Determinar configuración del icono
  const getIconConfig = () => {
    if (
      typeof icon === "string" &&
      advancedIconConfigs[icon as keyof typeof advancedIconConfigs]
    ) {
      return advancedIconConfigs[icon as keyof typeof advancedIconConfigs];
    }
    return advancedIconConfigs[config.defaultIcon];
  };

  const iconConfig = getIconConfig();

  // Renderizar icono elaborado
  const renderAdvancedIcon = () => {
    if (!showIcon) return null;

    const IconComponent = React.isValidElement(icon)
      ? icon
      : typeof icon === "string" &&
          advancedIconConfigs[icon as AdvancedDialogIcon]
        ? React.createElement(
            advancedIconConfigs[icon as AdvancedDialogIcon].icon,
            { className: "h-8 w-8" },
          )
        : React.createElement(iconConfig.icon, { className: "h-8 w-8" });

    return (
      <div className="flex justify-center mt-6">
        <div
          className={cn(
            "rounded-full p-3 shadow-lg border-4 border-white dark:border-gray-800",
            iconConfig.shadowColor,
          )}
        >
          <div
            className={cn(
              "p-3 rounded-full",
              iconConfig.bgColor,
              iconConfig.borderColor,
              iconAnimation && "animate-pulse",
            )}
          >
            <div className={iconConfig.iconColor}>{IconComponent}</div>
          </div>
        </div>
      </div>
    );
  };

  // Configuración por defecto de botones
  const defaultConfirmButton: AdvancedDialogButton = {
    label: config.confirmLabel,
    onClick: () => onOpenChange(false),
    variant: config.confirmVariant,
    icon: config.confirmIcon,
  };

  const defaultCancelButton: AdvancedDialogButton = {
    label: "Cancelar",
    onClick: () => onOpenChange(false),
    variant: "outline",
    icon: <X className="mr-2 h-4 w-4" />,
  };

  const finalConfirmButton = confirmButton || defaultConfirmButton;
  const finalCancelButton = cancelButton || defaultCancelButton;

  // Clases para el tamaño máximo
  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  };

  return (
    <Dialog open={open} onOpenChange={preventClose ? undefined : onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden rounded-xl border-0 shadow-xl",
          maxWidthClasses[maxWidth],
        )}
      >
        {/* Icono elaborado */}
        {renderAdvancedIcon()}

        {/* Header */}
        <DialogHeader className="pt-8 px-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="text-center text-gray-600 text-sm mt-1 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Contenido principal */}
          {(question || description || children) && (
            <>
              {contentCard ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-5 bg-gray-50 dark:bg-gray-800/50 shadow-inner">
                  {question && (
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
                      {question}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {description}
                    </p>
                  )}
                  {children && <div className="mt-4">{children}</div>}
                </div>
              ) : (
                <div className="mb-5">
                  {question && (
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
                      {question}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {description}
                    </p>
                  )}
                  {children && <div className="mt-4">{children}</div>}
                </div>
              )}
            </>
          )}

          {/* Divisor con gradiente */}
          {showDivider && (
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-5"></div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 pb-2">
            {/* Botones personalizados */}
            {customButtons?.map((button, index) => (
              <Button
                type="button"
                key={index}
                variant={button.variant || "default"}
                onClick={button.onClick}
                disabled={button.disabled || button.loading}
                className={cn(
                  "w-full transition-all duration-200",
                  button.variant === "outline" &&
                    "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 rounded-lg py-2.5",
                  button.variant === "destructive" &&
                    "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                  (!button.variant || button.variant === "default") &&
                    "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-300 rounded-lg py-2.5 shadow-sm",
                )}
              >
                {button.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {button.loadingText || "Cargando..."}
                  </>
                ) : (
                  <>
                    {button.icon}
                    {button.label}
                  </>
                )}
              </Button>
            ))}

            {/* Botones por defecto si no hay botones personalizados */}
            {!customButtons && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={finalCancelButton.onClick}
                  disabled={finalCancelButton.disabled}
                  className="
          border border-gray-300 dark:border-zinc-600 
          w-full 
          bg-white dark:bg-zinc-900 
          text-gray-700 dark:text-zinc-300 
          hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-zinc-800 dark:hover:text-white
          focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-zinc-500
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg py-2.5 
          transition-all duration-200
          font-medium
        "
                >
                  {finalCancelButton.icon}
                  {finalCancelButton.label}
                </Button>

                {/* Confirm Button */}
                <Button
                  type="button"
                  variant={finalConfirmButton.variant}
                  onClick={finalConfirmButton.onClick}
                  disabled={
                    finalConfirmButton.disabled || finalConfirmButton.loading
                  }
                  className={cn(
                    "w-full transition-all duration-200 rounded-lg py-2.5 shadow-sm font-medium",
                    finalConfirmButton.variant === "destructive"
                      ? `
              bg-red-600 dark:bg-red-700 
              text-white dark:text-white 
              border border-red-600 dark:border-red-600
              hover:bg-red-700 hover:text-white dark:hover:bg-red-600 dark:hover:text-white
              focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
              disabled:opacity-50 disabled:cursor-not-allowed
            `
                      : `
              bg-zinc-900 dark:bg-zinc-100 
              text-white dark:text-zinc-900 
              border border-zinc-900 dark:border-zinc-100
              hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-zinc-900
              focus:outline-none focus:ring-2 focus:ring-zinc-700 dark:focus:ring-zinc-300
              disabled:opacity-50 disabled:cursor-not-allowed
            `,
                  )}
                >
                  {finalConfirmButton.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {finalConfirmButton.loadingText || "Procesando..."}
                    </>
                  ) : (
                    <>
                      {finalConfirmButton.icon}
                      {finalConfirmButton.label}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
