import { create, all } from "mathjs";
import { toast } from "sonner";

const math = create(all);

export interface BielaManivelaParams {
  Lm: string;
  Lb: string;
  e: string;
  theta_m_deg: string;
  theta_b_deg: string;
  s: string;
  vel_m: string;
  vel_b: string;
  vel_s: string;
  acc_m: string;
  acc_b: string;
  acc_s: string;
}

export class BielaManivela {
  public Lm: number = 0;
  public Lb: number = 0;
  public e: number = 0;
  public theta_m_rad: number = 0;
  public theta_b_rad: number = 0;
  public s: number = 0;
  public vel_m: number = 0;
  public vel_b: number = 0;
  public vel_s: number = 0;
  public acc_m: number = 0;
  public acc_b: number = 0;
  public acc_s: number = 0;

  constructor() {}

  degToRadians(value: string) {
    return (parseFloat(value) * math.pi) / 180;
  }

  radiansToDegrees(value: number) {
    return (value * 180) / math.pi;
  }

  setParams(params: BielaManivelaParams) {
    this.Lm = parseFloat(params.Lm);
    this.Lb = parseFloat(params.Lb);
    this.e = parseFloat(params.e);
    this.theta_m_rad = this.degToRadians(params.theta_m_deg);
    this.theta_b_rad = this.degToRadians(params.theta_b_deg);
    this.s = parseFloat(params.s);
    this.vel_m = parseFloat(params.vel_m);
    this.vel_b = parseFloat(params.vel_b);
    this.vel_s = parseFloat(params.vel_s);
    this.acc_m = parseFloat(params.acc_m);
    this.acc_b = parseFloat(params.acc_b);
    this.acc_s = parseFloat(params.acc_s);
  }

  isNumber(value: string) {
    return !isNaN(parseFloat(value));
  }

  validateParam(value: string, name: string) {
    if (value === "") {
      throw new Error(name + " no puede estar vacío");
    }
    if (!this.isNumber(value)) {
      throw new Error(name + " debe ser un número");
    }
    if (parseFloat(value) <= 0) {
      throw new Error(name + " debe ser mayor que cero");
    }
    return parseFloat(value);
  }

  validateParams(params: BielaManivelaParams) {
    try {
      this.Lm = this.validateParam(params.Lm, "Longitud de manivela (Lm)");
      this.Lb = this.validateParam(params.Lb, "Longitud de biela (Lb)");
      this.e = this.validateParam(params.e, "Excentricidad (e)");

      if (this.Lm + math.abs(this.e) > this.Lb) {
        throw new Error(
          "La suma de la longitud de la manivela (Lm) y la excentricidad (e) no puede ser mayor a la longitud de la biela (Lb)"
        );
      }

      const inputParams = [
        params.theta_m_deg !== "",
        params.theta_b_deg !== "",
        params.s !== "",
      ].filter(Boolean).length;

      if (inputParams === 0) {
        throw new Error(
          "Se debe proporcionar al menos uno de los siguientes: ángulo de manivela, ángulo de biela o posición"
        );
      }
      if (inputParams > 1) {
        throw new Error(
          "Solo se debe proporcionar uno de los siguientes: ángulo de manivela, ángulo de biela o posición"
        );
      }

      if (params.theta_m_deg !== "") {
        if (
          parseFloat(params.theta_m_deg) < 0 ||
          parseFloat(params.theta_m_deg) > 360
        ) {
          throw new Error(
            "El ángulo de la manivela debe estar entre 0° y 360°"
          );
        }
        this.theta_m_rad = this.degToRadians(params.theta_m_deg);
      }

      if (params.theta_b_deg !== "") {
        if (
          parseFloat(params.theta_b_deg) < 0 ||
          parseFloat(params.theta_b_deg) > 360
        ) {
          throw new Error("El ángulo de la biela debe estar entre 0° y 360°");
        }
        this.theta_b_rad = this.degToRadians(params.theta_b_deg);
      }

      if (params.s !== "") {
        const result = math.sqrt(
          math.subtract(
            math.pow(parseFloat(params.Lm) + parseFloat(params.Lb), 2),
            math.pow(parseFloat(params.e), 2)
          ) as number
        );
        if (math.isComplex(result)) {
          throw new Error(
            "El resultado es un número complejo, no se puede comparar."
          );
        }

        if (parseFloat(params.s) < 0 || parseFloat(params.s) > result) {
          throw new Error(
            "La posición (s) no puede ser mayor que " + result.toFixed(2)
          );
        }
        this.s = parseFloat(params.s);
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return false;
      }
    }
  }

  equationOfMotion() {
    if (this.theta_m_rad !== 0) {
      const dividend = math.add(
        math.multiply(this.Lm, math.sin(this.theta_m_rad)),
        this.e
      );
      const divisor = this.Lb;
      const asin_argument = dividend / divisor;

      this.theta_b_rad = math.asin(asin_argument) as number;
      this.s =
        this.Lm * math.cos(this.theta_m_rad) +
        this.Lb * math.cos(this.theta_b_rad);

      return {
        theta_m_deg: this.radiansToDegrees(this.theta_m_rad),
        theta_b_deg: this.radiansToDegrees(this.theta_b_rad),
        s: this.s,
      };
    }

    if (this.theta_b_rad !== 0) {
      const dividend = math.subtract(
        math.multiply(this.Lb, math.sin(this.theta_b_rad)),
        this.e
      );
      const divisor = this.Lm;

      this.theta_m_rad = math.asin(dividend / divisor) as number;
      this.s =
        this.Lm * math.cos(this.theta_m_rad) +
        this.Lb * math.cos(this.theta_b_rad);

      return {
        theta_m_deg: this.radiansToDegrees(this.theta_m_rad),
        theta_b_deg: this.radiansToDegrees(this.theta_b_rad),
        s: this.s,
      };
    }

    if (this.s !== 0) {
      this.theta_b_rad = math.sum(
        math.atan(math.divide(this.e, this.s)),
        math.acos(
          math.divide(
            math.subtract(
              math.sum(
                math.pow(this.s, 2) as number,
                math.pow(this.e, 2) as number,
                math.pow(this.Lb, 2) as number
              ),
              math.pow(this.Lm, 2)
            ),
            math.multiply(2, this.Lb)
          ) as number
        ) as number
      );
      console.log(this.radiansToDegrees(this.theta_b_rad));

      this.theta_m_rad = math.acos(
        math.divide(
          math.subtract(
            this.s,
            math.multiply(this.Lb, math.cos(this.theta_b_rad))
          ),
          this.Lm
        )
      ) as number;
      console.log(this.theta_m_rad);
      console.log(this.radiansToDegrees(this.theta_m_rad));

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }
  }

  calculateVelocity() {
    if (this.vel_m) {
      const A = [
        [
          this.Lm * math.sin(this.theta_m_rad),
          this.Lb * math.sin(this.theta_b_rad),
          1,
        ],
        [
          this.Lm * math.cos(this.theta_m_rad),
          -this.Lb * math.cos(this.theta_b_rad),
          0,
        ],
        [1, 0, 0],
      ];

      const b = [0, 0, this.vel_m];

      const x = math.lusolve(A, b) as number[][];

      const [theta_b_dot, s_dot] = [x[1][0], x[2][0]];
      this.vel_b = theta_b_dot;
      this.vel_s = s_dot;

      return {
        theta_m_dot: this.vel_m,
        theta_b_dot,
        s_dot,
      };
    } else if (this.vel_b) {
      return {
        theta_m_dot: this.vel_m,
        theta_b_dot: this.vel_b,
        s_dot: this.vel_s,
      };
    }
  }

  calculateAcceleration() {}
}
