import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";

interface Estadisticas {
  total_admisiones: number;
  por_estado: Record<string, number>;
  por_prioridad: Record<string, number>;
}

export function Estadisticas({
  refresh,
}: {
  refresh?: number;
}) {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    cargarEstadisticas();
  }, [refresh]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/estadisticas`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok)
        throw new Error("Error al cargar estadísticas");
      const data = await response.json();
      setStats(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Cargando estadísticas...
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataEstados = Object.entries(stats.por_estado).map(
    ([estado, cantidad]) => ({
      estado,
      cantidad,
    }),
  );

  const dataPrioridad = Object.entries(stats.por_prioridad).map(
    ([prioridad, cantidad]) => ({
      prioridad,
      cantidad,
    }),
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            Total Admisiones
          </CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats.total_admisiones}
          </div>
          <p className="text-xs text-muted-foreground">
            Vehículos en el taller
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Pendientes</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats.por_estado["pendiente"] || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Esperando diagnóstico
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            En Reparación
          </CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats.por_estado["en reparación"] || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Trabajos activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Listos</CardTitle>
          <CheckCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats.por_estado["listo"] || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Para entregar
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataEstados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estado" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribución por Prioridad</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPrioridad}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ prioridad, percent }) =>
                  `${prioridad}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {dataPrioridad.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}