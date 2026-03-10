"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Tag,
  Hash,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  Search,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TiptapEditor } from "./editor-tiptap";
import { extractUsedVariables, PLANTILLA_VARIABLES } from "../utils/variables";
import { plantillaLegalQkeys } from "@/hooks/use-plantillas-legales/Qk";
import {
  useCreatePlantillaLegal,
  usePlantillaLegalById,
  useUpdatePlantillaLegal,
} from "@/hooks/use-plantillas-legales/use-plantillas-legales";
import { CreatePlantillaLegalDto } from "@/features/plantillas-legales";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";

// ── Enum ────────────────────────────────────────────────────────────────────
enum TipoPlantillaLegal {
  CONTRATO = "CONTRATO",
  PAGARE = "PAGARE",
}

// ── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  version: z
    .string()
    .min(1, "La versión es requerida")
    .regex(/^v\d+(\.\d+)*$/, "Formato: v1.0"),
  tipo: z.nativeEnum(TipoPlantillaLegal),
  activa: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ── Variables panel ──────────────────────────────────────────────────────────
function VariablesPanel({ content }: { content: string }) {
  const usedVars = extractUsedVariables(content);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function copy(key: string) {
    navigator.clipboard.writeText(`{{${key}}}`);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = PLANTILLA_VARIABLES.map((g) => ({
    ...g,
    items: g.items.filter(
      (v) =>
        !search ||
        v.key.toLowerCase().includes(search.toLowerCase()) ||
        v.label.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  const usedCount = PLANTILLA_VARIABLES.flatMap((g) => g.items).filter((v) =>
    usedVars.has(v.key),
  ).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Variables disponibles</span>
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {usedCount} usadas
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            className="h-7 text-xs pl-6"
            placeholder="Buscar variable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filtered.map((group) => {
          const isOpen = openGroups[group.group] !== false;
          return (
            <div
              key={group.group}
              className="rounded-md border border-border overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-muted/40 hover:bg-muted/60 transition-colors"
                onClick={() =>
                  setOpenGroups((p) => ({
                    ...p,
                    [group.group]: !p[group.group],
                  }))
                }
              >
                <span className="text-[10px] font-medium flex items-center gap-1.5">
                  <span>{group.icon}</span>
                  {group.group}
                  <span className="text-muted-foreground font-normal">
                    ({group.items.length})
                  </span>
                </span>
                {isOpen ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>

              {isOpen && (
                <div className="divide-y divide-border/50">
                  {group.items.map((v) => {
                    const isUsed = usedVars.has(v.key);
                    const isCopied = copied === v.key;
                    return (
                      <div
                        key={v.key}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-muted/20 transition-colors ${isUsed ? "bg-emerald-500/5" : ""}`}
                      >
                        <div className="min-w-0">
                          <code className="text-[10px] font-mono text-primary block truncate">{`{{${v.key}}}`}</code>
                          <span className="text-[9px] text-muted-foreground truncate block">
                            Ej: {v.example}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isUsed && (
                            <span className="text-[9px] text-emerald-500 font-medium">
                              ✓
                            </span>
                          )}
                          <button
                            onClick={() => copy(v.key)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Copiar"
                          >
                            {isCopied ? (
                              <CheckCheck className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── UI compartida ────────────────────────────────────────────────────────────
interface UIProps {
  form: ReturnType<typeof useForm<FormValues>>;
  content: string;
  setContent: (v: string) => void;
  isPending: boolean;
  isEditing: boolean;
  titulo: string;
  onSave: (html: string) => Promise<unknown>; // ← era Promise<void>
  onBack: () => void;
}

function PlantillaLegalFormUI({
  form,
  content,
  setContent,
  isPending,
  isEditing,
  titulo,
  onSave,
  onBack,
}: UIProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              {isEditing ? "Editar plantilla" : "Nueva plantilla legal"}
            </h1>
            <p className="text-xs text-muted-foreground">{titulo}</p>
          </div>
        </div>
      </div>

      {/* Campos */}
      <Card>
        <CardHeader className="px-4 py-2.5 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Información de la plantilla
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel className="text-xs flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Contrato de crédito comercial"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> Versión
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-8 text-xs"
                        placeholder="v1.0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1.5">
                      <Tag className="h-3 w-3" /> Tipo
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={TipoPlantillaLegal.CONTRATO}
                          className="text-xs"
                        >
                          Contrato
                        </SelectItem>
                        <SelectItem
                          value={TipoPlantillaLegal.PAGARE}
                          className="text-xs"
                        >
                          Pagaré
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activa"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 pt-5">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-xs flex items-center gap-1 cursor-pointer">
                      <ToggleLeft className="h-3 w-3" />
                      {field.value ? "Activa" : "Inactiva"}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Editor + Variables */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <TiptapEditor
            isPending={isPending}
            content={content}
            onUpdate={setContent}
            onSave={onSave}
            placeholder="Usa {{variable}} para insertar datos dinámicos..."
          />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden p-0">
            <VariablesPanel content={content} />
          </Card>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="px-4 py-2.5 border-b border-border bg-muted/30 flex-row items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Vista previa
          </span>
          <Badge variant="outline" className="text-[10px]">
            {extractUsedVariables(content).size} variables insertadas
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-white dark:bg-background border rounded-md shadow-sm p-6 sm:p-10">
            <div
              className="prose prose-sm max-w-none [&_p]:min-h-[1em] [&_p:empty]:min-h-[1em] [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── CREAR ────────────────────────────────────────────────────────────────────
export function PlantillaLegalForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useCreatePlantillaLegal();
  const [content, setContent] = useState("<p>Escribe el contrato aquí...</p>");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      version: "v1.0",
      tipo: TipoPlantillaLegal.CONTRATO,
      activa: true,
    },
  });

  async function handleSave(html: string): Promise<void> {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Revisa los campos del formulario");
      return;
    }
    const payload: CreatePlantillaLegalDto = {
      ...form.getValues(),
      contenido: html,
    };
    void toast.promise(mutation.mutateAsync(payload), {
      // ← void aquí
      loading: "Registrando plantilla...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: plantillaLegalQkeys.all });
        form.reset();
        setContent("<p>Escribe el contrato aquí...</p>");
        return "Plantilla registrada";
      },
      error: (err) => getApiErrorMessageAxios(err),
    });
  }

  return (
    <PlantillaLegalFormUI
      form={form}
      content={content}
      setContent={setContent}
      isPending={mutation.isPending}
      isEditing={false}
      titulo="Diseña el contrato con variables dinámicas"
      onSave={handleSave}
      onBack={() => navigate(-1)}
    />
  );
}

// ── EDITAR ───────────────────────────────────────────────────────────────────
export function PlantillaLegalFormEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: plantilla, isLoading } = usePlantillaLegalById(Number(id));
  const mutation = useUpdatePlantillaLegal(Number(id));
  const [content, setContent] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      version: "v1.0",
      tipo: TipoPlantillaLegal.CONTRATO,
      activa: true,
    },
  });

  useEffect(() => {
    if (plantilla) {
      form.reset({
        nombre: plantilla.nombre,
        version: plantilla.version,
        tipo: plantilla.tipo as TipoPlantillaLegal,
        activa: plantilla.activa,
      });
      setContent(plantilla.contenido);
    }
  }, [plantilla]);

  if (isLoading)
    return <p className="text-xs p-6 text-muted-foreground">Cargando...</p>;
  if (!plantilla)
    return (
      <p className="text-xs p-6 text-muted-foreground">
        Plantilla no encontrada
      </p>
    );

  async function handleSave(html: string) {
    const isValid = await form.trigger();
    if (!isValid) return toast.error("Revisa los campos del formulario");

    const payload: CreatePlantillaLegalDto = {
      ...form.getValues(),
      contenido: html,
    };
    toast.promise(mutation.mutateAsync(payload as any), {
      loading: "Actualizando plantilla...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: plantillaLegalQkeys.all });
        return "Plantilla actualizada";
      },
      error: (err) => getApiErrorMessageAxios(err),
    });
  }

  return (
    <PlantillaLegalFormUI
      form={form}
      content={content}
      setContent={setContent}
      isPending={mutation.isPending}
      isEditing={true}
      titulo={`Editando: ${plantilla.nombre}`}
      onSave={handleSave}
      onBack={() => navigate(-1)}
    />
  );
}
