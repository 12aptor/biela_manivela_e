import { create, all } from "mathjs";
import { toast } from "sonner";

const math = create(all);

interface BielaManivelaParams {
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
  public Lm: number;
  public Lb: number;
  public e: number;
  public theta_m_rad: number;
  public theta_b_rad: number;
  public s: number;
  public vel_m: number;
  public vel_b: number;
  public vel_s: number;
  public acc_m: number;
  public acc_b: number;
  public acc_s: number;

  constructor() {}

  convertToRadians(value: string) {
    return (parseFloat(value) * math.pi) / 180;
  }

  convertToNumber(value: string) {
    return parseFloat(value);
  }

  setParams(params: BielaManivelaParams) {
    this.Lm = this.convertToNumber(params.Lm);
    this.Lb = this.convertToNumber(params.Lb);
    this.e = this.convertToNumber(params.e);
    this.theta_m_rad = this.convertToRadians(params.theta_m_deg);
    this.theta_b_rad = this.convertToRadians(params.theta_b_deg);
    this.s = this.convertToNumber(params.s);
    this.vel_m = this.convertToNumber(params.vel_m);
    this.vel_b = this.convertToNumber(params.vel_b);
    this.vel_s = this.convertToNumber(params.vel_s);
    this.acc_m = this.convertToNumber(params.acc_m);
    this.acc_b = this.convertToNumber(params.acc_b);
    this.acc_s = this.convertToNumber(params.acc_s);
  }

  validateParams(params: BielaManivelaParams) {
    try {
      if (params.Lm === undefined) {
        throw new Error(
          "La longitud de la manivela (Lm) debe ser mayor que cero"
        );
      }
      this.Lm = parseFloat(params.Lm);

      if (params.Lb === undefined) {
        throw new Error("La longitud de la biela (Lb) debe ser mayor que cero");
      }
      this.Lb = parseFloat(params.Lb);

      // Validar que solo se proporcione uno de los ángulos o la posición
      const inputParams = [
        this.params.theta_m_deg !== undefined,
        this.params.theta_b_deg !== undefined,
        this.params.s !== undefined,
      ].filter(Boolean).length;

      if (inputParams > 1) {
        throw new Error(
          "Solo se debe proporcionar uno de los siguientes: ángulo de manivela, ángulo de biela o posición"
        );
      }

      // Validar rangos angulares si se proporcionan
      if (
        this.theta_m_rad !== undefined &&
        (this.theta_m_rad < -360 || this.theta_m_rad > 360)
      ) {
        throw new Error(
          "El ángulo de la manivela debe estar entre -360° y 360°"
        );
      }

      if (
        this.theta_b_rad !== undefined &&
        (this.theta_b_rad < -360 || this.theta_b_rad > 360)
      ) {
        throw new Error("El ángulo de la biela debe estar entre -360° y 360°");
      }

      // Validar que la relación Lb/Lm sea razonable (regla empírica)
      if (this.Lb / this.Lm < 2) {
        throw new TypeError(
          "La relación longitud biela/manivela (Lb/Lm) es menor a 2, lo que puede causar problemas mecánicos"
        );
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (error instanceof TypeError) {
        toast.warning(error.message);
      }
      return false;
    }
  }

  calculatePosition() {
    this.s =
      this.Lm * math.cos(this.theta_m_rad) +
      this.Lb * math.sin(this.theta_b_rad);
    return this.s;
  }

  equationOfMotion() {
    if (this.params.theta_m_deg) {
      const dividend = math.add(
        math.multiply(this.params.Lm, math.sin(this.theta_m_rad)),
        this.params.e
      );
      const divisor = this.params.Lb;
      const asin_argument = dividend / divisor;

      this.theta_b_rad = math.asin(asin_argument) as number;
      this.calculatePosition();

      return {
        theta_m_deg: this.params.theta_m_deg,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }

    if (this.params.theta_b_deg) {
      const dividend = math.subtract(
        math.multiply(this.params.Lb, math.sin(this.theta_b_rad)),
        this.params.e
      );
      const divisor = this.params.Lm;

      this.theta_m_rad = math.asin(dividend / divisor) as number;
      this.calculatePosition();

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: this.params.theta_b_deg,
        s: this.s,
      };
    }

    if (this.params.s) {
      const acos_dividend = math.add(
        math.add(math.pow(this.params.s, 2), math.pow(this.params.e, 2)),
        math.subtract(math.pow(this.params.Lb, 2), math.pow(this.params.Lm, 2))
      );
      const acos_divisor = math.multiply(2, this.params.Lb);
      const acos_argument = math.divide(acos_dividend, acos_divisor) as number;
      this.theta_b_rad = math.add(
        math.atan(math.divide(this.params.e, this.params.s)),
        math.acos(acos_argument)
      ) as number;

      console.log({
        acos_dividend: acos_dividend,
        acos_divisor: acos_divisor,
        acos_argument: acos_argument,
        theta_b_rad: this.theta_b_rad,
      });

      const asin_dividend = math.subtract(
        math.multiply(this.params.Lb, math.sin(this.theta_b_rad)),
        this.params.e
      );
      const asin_divisor = this.params.Lm;

      this.theta_m_rad = math.asin(asin_dividend / asin_divisor) as number;

      console.log({
        asin_dividend: asin_dividend,
        asin_divisor: asin_divisor,
        theta_m_rad: this.theta_m_rad,
      });

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }
  }

  calculateVelocity() {
    if (this.params.vel_m) {
      const A = [
        [
          this.params.Lm * math.sin(this.theta_m_rad),
          this.params.Lb * math.sin(this.theta_b_rad),
          1,
        ],
        [
          this.params.Lm * math.cos(this.theta_m_rad),
          -this.params.Lb * math.cos(this.theta_b_rad),
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
    } else if (this.params.vel_b) {
      return {
        theta_m_dot: this.vel_m,
        theta_b_dot: this.vel_b,
        s_dot: this.vel_s,
      };
    }
  }
}
